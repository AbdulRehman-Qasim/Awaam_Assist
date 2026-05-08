import { useState, useRef, useCallback, useEffect } from "react";
import { SpeechRecognitionConfig } from "@/types/interview";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onstart: () => void;
    onend: () => void;
    start(): void;
    stop(): void;
    abort(): void;
  }
}

export const useSpeechRecognition = (config: SpeechRecognitionConfig) => {
  const { onFinalTranscript, blocked, isTimeUp, isCompleted } = config;
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const isFinalRef = useRef<boolean>(false);
  const hasSubmittedForCurrentTurnRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  const startSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    const INACTIVITY_WINDOW_MS = 3000;
    silenceTimerRef.current = window.setTimeout(() => {
      const now = Date.now();
      const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
      if (
        timeSinceLastSpeech >= INACTIVITY_WINDOW_MS &&
        !hasSubmittedForCurrentTurnRef.current &&
        finalTranscriptRef.current.trim() &&
        !blocked
      ) {
        handleFinalSubmission();
      } else {
        startSilenceTimer();
      }
    }, INACTIVITY_WINDOW_MS);
  }, [blocked]);

  const handleFinalSubmission = useCallback(() => {
    if (hasSubmittedForCurrentTurnRef.current || isTimeUp || isCompleted || blocked) return;

    if (finalTranscriptRef.current.trim()) {
      hasSubmittedForCurrentTurnRef.current = true;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      onFinalTranscript(finalTranscriptRef.current);
      finalTranscriptRef.current = "";
      isFinalRef.current = false;
    }
  }, [onFinalTranscript, isTimeUp, isCompleted, blocked]);

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current || isTimeUp || isCompleted || blocked) {
      console.log("Speech recognition blocked:", { isTimeUp, isCompleted, blocked });
      return;
    }

    try {
      // Stop any existing recognition
      try {
        recognitionRef.current.stop();
      } catch (e) { }

      // Reset state
      finalTranscriptRef.current = "";
      isFinalRef.current = false;
      hasSubmittedForCurrentTurnRef.current = false;
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          console.log("Speech recognition started");
        } catch (error) {
          console.error("Error starting speech recognition:", error);
        }
      }, 100);
    } catch (error) {
      console.error("Error preparing speech recognition:", error);
    }
  }, [isTimeUp, isCompleted, blocked]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        console.log("Speech recognition stopped");
      } catch (e) {
        console.log("Error stopping recognition:", e);
      }
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (isTimeUp || isCompleted) return;
    
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        if (blocked) return;

        let finalTranscript = finalTranscriptRef.current || "";
        let hasNewFinal = false;
        let detectedAnySpeech = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          
          if (transcript) {
            detectedAnySpeech = true;
          }

          if (result.isFinal) {
            if (transcript) {
              if (finalTranscript && !finalTranscript.endsWith(" ")) {
                finalTranscript += " ";
              }
              finalTranscript += transcript;
              hasNewFinal = true;
            }
          }
        }

        if (hasNewFinal) {
          finalTranscript = finalTranscript.replace(/\s+/g, " ").trim();
          finalTranscriptRef.current = finalTranscript;
          isFinalRef.current = true;
          lastSpeechTimeRef.current = Date.now();
          startSilenceTimer();
        }

        if (detectedAnySpeech) {
          lastSpeechTimeRef.current = Date.now();
          startSilenceTimer();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
        
        // Auto-restart if not blocked and not submitted
        if (!blocked && !hasSubmittedForCurrentTurnRef.current && !isTimeUp && !isCompleted) {
          setTimeout(() => {
            if (!blocked && !hasSubmittedForCurrentTurnRef.current) {
              startSpeechRecognition();
            }
          }, 500);
        }
      };

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
      };
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [blocked, isTimeUp, isCompleted, startSilenceTimer, startSpeechRecognition]);

  return {
    isListening,
    startSpeechRecognition,
    stopSpeechRecognition,
    finalTranscript: finalTranscriptRef.current,
    hasSubmittedForCurrentTurn: hasSubmittedForCurrentTurnRef.current,
    resetSubmission: () => {
      hasSubmittedForCurrentTurnRef.current = false;
      finalTranscriptRef.current = "";
    }
  };
};