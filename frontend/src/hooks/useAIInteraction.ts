import { useState, useRef, useCallback } from "react";
import { Message, CandidateInfo, JobInfo } from "@/types/interview";

export const useAIInteraction = (
  candidateInfo: CandidateInfo | null,
  jobInfo: JobInfo | null
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const completionMessageSentRef = useRef<boolean>(false);
  const previousQuestion = useRef<string | null>(null);
  const askedQuestionsRef = useRef<Set<string>>(new Set());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasSpokenWelcome = useRef(false);

  const extractQuestionFromText = useCallback((text: string): string => {
    if (!text) return "";
    const sentences = text
      .split(/(?<=[\.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (let i = sentences.length - 1; i >= 0; i--) {
      if (sentences[i].endsWith("?")) {
        return sentences[i];
      }
    }

    return sentences[sentences.length - 1] || text.trim();
  }, []);

  const speakText = useCallback(
    (text: string, onEnd?: () => void, onStartListening?: () => void) => {
      if (!text.trim()) {
        if (onEnd) onEnd();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setIsAiSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        console.log("Speech synthesis started");
        setIsAiSpeaking(true);
      };

      utterance.onend = () => {
        console.log("Speech synthesis ended");
        setIsAiSpeaking(false);

        // Start listening for candidate response after AI finishes speaking
        if (onStartListening) {
          console.log("Starting to listen for candidate response");
          onStartListening();
        }

        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsAiSpeaking(false);

        // Start listening even if there's an error
        if (onStartListening) {
          console.log("Starting to listen after speech error");
          onStartListening();
        }

        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // const handleCandidateResponse = useCallback(async (userResponse: string, hasShownWelcome: boolean, isStopped: boolean, startListeningCallback?: () => void) => {
  //   if (!userResponse || !userResponse.trim() || !candidateInfo) {
  //     console.log("Response blocked due to missing data");
  //     return;
  //   }

  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     sender: "candidate",
  //     content: userResponse,
  //     timestamp: new Date(),
  //     type: "response",
  //   };

  //   setIsAiThinking(true);

  //   try {
  //     const context = [...messages, userMessage]
  //       .filter((msg, index) => {
  //         if (index === 1 && hasShownWelcome) {
  //           return false;
  //         }
  //         return true;
  //       })
  //       .map((msg) => ({
  //         speaker: msg.sender,
  //         text: msg.content,
  //       }));

  //     const res = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         context,
  //         askedQuestions: Array.from(askedQuestionsRef.current),
  //         requireNewQuestion: true,
  //       }),
  //     });

  //     let data = await res.json();

  //     if (typeof data.reply === 'string' && data.reply.includes('"reply"')) {
  //       try {
  //         const parsed = JSON.parse(data.reply);
  //         data = {
  //           reply: parsed.reply,
  //           score: parsed.score,
  //           isInterviewEnded: parsed.isInterviewEnded,
  //         };
  //       } catch (e) {
  //         console.error('Failed to parse AI JSON response:', e);
  //       }
  //     }

  //     if (!data.score || data.score === 0) {
  //       const scoreMatch = data.reply.match(/(?:score[:\s]+|score of\s+)(\d+)/i);
  //       if (scoreMatch) {
  //         data.score = parseInt(scoreMatch[1]);
  //       }
  //     }

  //     // Don't add AI response if completion message has been sent
  //     if (completionMessageSentRef.current) {
  //       console.log("Completion message already sent - saving user response but not adding AI response to UI");

  //       await fetch(`${import.meta.env.VITE_API_URL}/interview/save-chat`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           candidateId: candidateInfo._id,
  //           question: previousQuestion.current || "Final question",
  //           answer: userResponse,
  //           score: data.score ? (data.score * 10) : 0,
  //         }),
  //       });

  //       return;
  //     }

  //     let cleanedReply = data.reply;
  //     if (typeof data.reply === 'string') {
  //       cleanedReply = data.reply.replace(/\s*(?:score:?\s*\d+|score\s+of\s+\d+).*$/i, '');
  //       cleanedReply = cleanedReply.replace(/\s*\(?score:?\s*\d*\.?\d+\)?/gi, '');
  //       cleanedReply = cleanedReply.replace(/\s*Your score for this answer is:?\s*\d+/gi, '');
  //       cleanedReply = cleanedReply.replace(/\s*(?:isInterviewEnded:?\s*[01]|interview\s+(?:ended|continuing):?\s*[01])/gi, '');
  //       cleanedReply = cleanedReply.replace(/\s*Interview status:?\s*(?:continuing|ended)/gi, '');
  //     }

  //     const aiReply: Message = {
  //       id: Date.now() + 1 + "",
  //       sender: "ai",
  //       content: cleanedReply,
  //       timestamp: new Date(),
  //       type: "question",
  //     };

  //     setMessages((prev) => [...prev, userMessage, aiReply]);

  //     await fetch(`${import.meta.env.VITE_API_URL}/interview/save-chat`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         candidateId: candidateInfo._id,
  //         question: previousQuestion.current || "Welcome question",
  //         answer: userResponse,
  //         score: data.score ? (data.score * 10) : 0,
  //       }),
  //     });

  //     // Update asked set and previous question
  //     const newQuestion = extractQuestionFromText(data.reply || "");
  //     if (newQuestion) {
  //       askedQuestionsRef.current.add(newQuestion);
  //       previousQuestion.current = newQuestion;
  //     }

  //     if (data.reply) {
  //       // Speak the AI response and start listening when done
  //       speakText(data.reply,
  //         () => {
  //           console.log("AI finished speaking");
  //           setIsAiThinking(false);
  //         },
  //         startListeningCallback // This will start listening for the candidate
  //       );
  //     } else {
  //       setIsAiThinking(false);
  //       if (startListeningCallback) {
  //         startListeningCallback();
  //       }
  //     }

  //   } catch (err) {
  //     console.error("AI API error:", err);
  //     setIsAiThinking(false);
  //     if (startListeningCallback) {
  //       startListeningCallback();
  //     }
  //   }
  // }, [messages, candidateInfo, extractQuestionFromText, speakText]);

  const handleCandidateResponse = useCallback(
    async (
      userResponse: string,
      hasShownWelcome: boolean,
      isStopped: boolean,
      startListeningCallback?: () => void
    ) => {
      if (!userResponse || !userResponse.trim() || !candidateInfo) {
        console.log("Response blocked due to missing data");
        return;
      }
      console.log("isStopped in handleCandidateResponse: ", isStopped);

      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "candidate",
        content: userResponse,
        timestamp: new Date(),
        type: "response",
      };

      setIsAiThinking(true);

      try {
        const context = [...messages, userMessage]
          .filter((msg, index) => {
            if (index === 1 && hasShownWelcome) {
              return false;
            }
            return true;
          })
          .map((msg) => ({
            speaker: msg.sender,
            text: msg.content,
          }));

        // If interview is stopped, add formal ending instruction to context
        const finalContext = isStopped
          ? [
              userMessage,
              {
                speaker: "system",
                text: "The interview time has ended. Please provide a formal and professional closing message to conclude the interview. Thank the candidate for their time, provide brief constructive feedback on their overall performance, and let them know the next steps in the hiring process. Keep it concise but warm and professional.",
              },
            ]
          : context;

        console.log("finalContext: ", finalContext);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: finalContext,
            askedQuestions: Array.from(askedQuestionsRef.current),
            requireNewQuestion: !isStopped, // Don't require new questions if interview is ending
          }),
        });

        let data = await res.json();

        if (typeof data.reply === "string" && data.reply.includes('"reply"')) {
          try {
            const parsed = JSON.parse(data.reply);
            data = {
              reply: parsed.reply,
              score: parsed.score,
              isInterviewEnded: parsed.isInterviewEnded,
            };
          } catch (e) {
            console.error("Failed to parse AI JSON response:", e);
          }
        }

        if (!data.score || data.score === 0) {
          const scoreMatch = data.reply.match(
            /(?:score[:\s]+|score of\s+)(\d+)/i
          );
          if (scoreMatch) {
            data.score = parseInt(scoreMatch[1]);
          }
        }

        // Don't add AI response if completion message has been sent
        if (completionMessageSentRef.current) {
          console.log(
            "Completion message already sent - saving user response but not adding AI response to UI"
          );

          await fetch(`${import.meta.env.VITE_API_URL}/interview/save-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateId: candidateInfo._id,
              question: previousQuestion.current || "Final question",
              answer: userResponse,
              score: data.score ? data.score * 10 : 0,
            }),
          });

          return;
        }

        let cleanedReply = data.reply;
        if (typeof data.reply === "string") {
          cleanedReply = data.reply.replace(
            /\s*(?:score:?\s*\d+|score\s+of\s+\d+).*$/i,
            ""
          );
          cleanedReply = cleanedReply.replace(
            /\s*\(?score:?\s*\d*\.?\d+\)?/gi,
            ""
          );
          cleanedReply = cleanedReply.replace(
            /\s*Your score for this answer is:?\s*\d+/gi,
            ""
          );
          cleanedReply = cleanedReply.replace(
            /\s*(?:isInterviewEnded:?\s*[01]|interview\s+(?:ended|continuing):?\s*[01])/gi,
            ""
          );
          cleanedReply = cleanedReply.replace(
            /\s*Interview status:?\s*(?:continuing|ended)/gi,
            ""
          );
        }

        const aiReply: Message = {
          id: Date.now() + 1 + "",
          sender: "ai",
          content: cleanedReply,
          timestamp: new Date(),
          type: "question",
        };

        setMessages((prev) => [...prev, userMessage, aiReply]);

        await fetch(`${import.meta.env.VITE_API_URL}/interview/save-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidateInfo._id,
            question: previousQuestion.current || "Welcome question",
            answer: userResponse,
            score: data.score ? data.score * 10 : 0,
          }),
        });

        // Update asked set and previous question only if interview is not stopped
        if (!isStopped) {
          const newQuestion = extractQuestionFromText(data.reply || "");
          if (newQuestion) {
            askedQuestionsRef.current.add(newQuestion);
            previousQuestion.current = newQuestion;
          }
        }

        if (data.reply) {
          if (isStopped) {
          
            await new Promise<void>((resolve) => {
              speakText(
                data.reply,
                () => {
                  console.log("AI finished speaking (final message)");
                  setIsAiThinking(false);
                  completionMessageSentRef.current = true;
                  resolve();
                },
                undefined
              );
            });
          } else {
            // Ongoing interview: speak and then resume listening
            speakText(
              data.reply,
              () => {
                console.log("AI finished speaking");
                setIsAiThinking(false);
                if (startListeningCallback) {
                  startListeningCallback();
                }
              },
              startListeningCallback
            );
          }
        } else {
          setIsAiThinking(false);
          // Only start listening if interview is not stopped
          if (startListeningCallback && !isStopped) {
            startListeningCallback();
          }
        }
      } catch (err) {
        console.error("AI API error:", err);
        setIsAiThinking(false);
        // Only start listening if interview is not stopped
        if (startListeningCallback && !isStopped) {
          startListeningCallback();
        }
      }
    },
    [messages, candidateInfo, extractQuestionFromText, speakText]
  );

  const setInitialMessages = useCallback(
    (messages: Message[]) => {
      setMessages(messages);

      // Extract initial question for asked questions
      if (messages[1]?.content) {
        const initialQuestion = extractQuestionFromText(messages[1].content);
        askedQuestionsRef.current.add(initialQuestion);
        previousQuestion.current = initialQuestion;

        // Speak welcome message
        if (!hasSpokenWelcome.current) {
          hasSpokenWelcome.current = true;
          speakText(
            messages[1].content,
            () => {
              console.log("Welcome message spoken");
            },
            () => {
              console.log("Ready to start listening after welcome");
            }
          );
        }
      }
    },
    [extractQuestionFromText, speakText]
  );

  return {
    messages,
    setMessages: setInitialMessages,
    isAiSpeaking,
    isAiThinking,
    handleCandidateResponse,
    speakText,
    completionMessageSent: completionMessageSentRef.current,
    setCompletionMessageSent: (sent: boolean) =>
      (completionMessageSentRef.current = sent),
    previousQuestion: previousQuestion.current,
  };
};
