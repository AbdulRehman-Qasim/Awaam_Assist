import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface InterviewHeaderProps {
  jobInfo: any;
  timeLeft: number;
  isRecording: boolean;
  isTimeUp: boolean;
  isUploading: boolean;
  videoUploaded: boolean;
  recordingTime: number;
  formatTimeRemaining: (seconds: number) => string;
  getTimeColor: (seconds: number) => string;
  interviewDuration: number;
  timeLimit: number;
  isLargeScreen: boolean;
  isChatVisible: boolean;
  onToggleChat: () => void;
}

export const InterviewHeader = ({
  jobInfo,
  timeLeft,
  isRecording,
  isTimeUp,
  isUploading,
  videoUploaded,
  recordingTime,
  formatTimeRemaining,
  getTimeColor,
  interviewDuration,
  timeLimit,
  isLargeScreen,
  isChatVisible,
  onToggleChat
}: InterviewHeaderProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex-shrink-0 bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-500"
              }`}
          ></div>
          <span className="text-sm font-medium text-white">
            {formatTime(recordingTime)}
          </span>
          {(isRecording || isUploading) && (
            <span className="text-xs text-red-400">
              {isUploading ? "SAVING..." : "REC"}
            </span>
          )}
        </div>

        {/* Time Remaining Display */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${timeLeft <= 30
                ? "bg-red-500 animate-pulse"
                : timeLeft <= 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
          ></div>
          <span
            className={`text-sm font-medium ${getTimeColor(interviewDuration)}`}
          >
            Time Left: {formatTimeRemaining(interviewDuration)}
          </span>
        </div>

        {isUploading && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-400">
              Uploading video...
            </span>
          </div>
        )}
        {videoUploaded && !isUploading && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-400">
              Video uploaded
            </span>
          </div>
        )}
      </div>

      <h1 className="text-xl font-semibold text-white">Interview Room</h1>

      <div className="flex items-center space-x-2">
        {isLargeScreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleChat}
            className="text-gray-300 hover:text-white lg:hidden"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        )}
        <span className="text-sm text-gray-300 ml-4">
          {jobInfo?.title || "Position"}
        </span>
      </div>
    </div>
  );
};