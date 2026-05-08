import { useState, useEffect, useRef } from "react";

interface TimerConfig {
  timeLimit: number;
  onTimeUp: () => void;
  isCompleted: boolean;
  loading: boolean;
}

export const useInterviewTimer = (config: TimerConfig) => {
  const { timeLimit, onTimeUp, isCompleted, loading } = config;
  
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const interviewTimerRef = useRef<number | null>(null);
  
  // Use a ref for the callback to avoid dependency issues
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!loading && !isCompleted) {
      interviewTimerRef.current = window.setInterval(() => {
        setInterviewDuration((prev) => {
          const newDuration = prev + 1;

          if (newDuration >= timeLimit && !isTimeUp) {
            setIsTimeUp(true);
            onTimeUpRef.current(); // Use the ref instead of the prop
          }

          return newDuration;
        });
      }, 1000);
    }

    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current);
        interviewTimerRef.current = null;
      }
    };
  }, [loading, isCompleted, isTimeUp, timeLimit]);
  // Removed onTimeUp from dependencies

  const formatTimeRemaining = (seconds: number) => {
    const remaining = Math.max(0, timeLimit - seconds);
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimeColor = (seconds: number) => {
    const remaining = timeLimit - seconds;
    if (remaining <= 30) return "text-red-400";
    if (remaining <= 60) return "text-yellow-400";
    return "text-white";
  };

  return {
    interviewDuration,
    isTimeUp,
    setIsTimeUp,
    formatTimeRemaining,
    getTimeColor,
    timeLeft: timeLimit - interviewDuration
  };
};