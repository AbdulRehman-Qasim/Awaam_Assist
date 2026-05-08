// import { VideoDisplay } from "./VideoDisplay";
// import { AiAvatar } from "./AiAvatar";
// import { SpeechWave } from "./SpeechWave";
// import { ChatPanel } from "./ChatPanel";

import { AiAvatar } from "@/pages/candidate/AiAvatar";
import { ChatPanel } from "@/pages/candidate/ChatPanel";
import { SpeechWave } from "@/pages/candidate/SpeechWave";
import { VideoDisplay } from "@/pages/candidate/VideoDisplay";

interface InterviewMainContentProps {
  candidateInfo: any;
  isListening: boolean;
  isAiSpeaking: boolean;
  isAiThinking: boolean;
  messages: any[];
  candidateInputBlocked: boolean;
  timeLimit: number;
  interviewDuration: number;
  isTimeUp: boolean;
  isLargeScreen: boolean;
  isChatVisible: boolean;
  onSendMessage: (text: string) => void; // Changed to accept text
  onToggleChat: () => void;
  inputBlocked: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

export const InterviewMainContent = ({
  candidateInfo,
  isListening,
  isAiSpeaking,
  isAiThinking,
  messages,
  candidateInputBlocked,
  timeLimit,
  interviewDuration,
  isTimeUp,
  isLargeScreen,
  isChatVisible,
  onSendMessage,
  onToggleChat,
  inputBlocked,
  currentQuestion = 0,
  totalQuestions = 20
}: InterviewMainContentProps) => {
  const formatTimeRemaining = (seconds: number) => {
    const remaining = Math.max(0, timeLimit - seconds);
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Side - Main Video */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ${isChatVisible ? "lg:pr-3" : "pr-6"
          } overflow-hidden`}
      >
        <div className="relative h-full">
          <VideoDisplay
            isListening={isListening}
            candidateName={candidateInfo?.name || "Candidate"}
          />

          {/* AI Avatar positioned in corner */}
          <div className="absolute bottom-6 right-6">
            <AiAvatar
              isAiSpeaking={isAiSpeaking}
              isAiThinking={isAiThinking}
            />
          </div>

          {/* Speech Wave Animation - Show under candidate name when user is speaking */}
          {isListening && !candidateInputBlocked && (
            <div className="absolute bottom-2 left-4">
              <SpeechWave isActive={isListening} speaker="user" />
            </div>
          )}

          {/* Speech Wave Animation - Show under AI avatar when AI is speaking */}
          {isAiSpeaking && (
            <div className="absolute bottom-2 right-6">
              <SpeechWave isActive={isAiSpeaking} speaker="ai" />
            </div>
          )}

          {/* Time Warning Overlay */}
          {timeLimit - interviewDuration <= 30 && !isTimeUp && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                <span className="font-semibold">
                  Warning: Only {formatTimeRemaining(interviewDuration)} remaining!
                </span>
              </div>
            </div>
          )}

          {/* Input Blocked Overlay */}
          {candidateInputBlocked && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                <span className="font-semibold">
                  Please wait for the interview to complete
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Panel (only on large screens) */}
      {isLargeScreen && (
        <div
          className={`transition-all duration-300 flex-shrink-0 ${isChatVisible
              ? "w-96 translate-x-0"
              : "w-0 translate-x-full lg:translate-x-0"
            } fixed lg:relative top-0 right-0 h-full lg:h-auto z-20 overflow-hidden`}
        >
          {isChatVisible && (
            <div className="h-full p-6 lg:pl-3 lg:pr-6 lg:py-6 overflow-hidden">
              <div className="h-full overflow-hidden">
                <ChatPanel
                  messages={messages}
                  isAiThinking={isAiThinking}
                  onSendMessage={onSendMessage}
                  onClose={onToggleChat}
                  inputBlocked={inputBlocked}
                  currentQuestion={currentQuestion}
                  totalQuestions={totalQuestions}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};