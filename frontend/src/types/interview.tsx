export interface Message {
  id: string;
  sender: "ai" | "candidate" | "system";
  content: string;
  timestamp: Date;
  type?: "greeting" | "question" | "response" | "score" | "instruction";
  score?: number;
}

export interface CandidateInfo {
  _id: string;
  name: string;
  status: string;
}

export interface JobInfo {
  _id: string;
  title: string;
  description: string;
  interviewDuration: number;
}

export interface InterviewState {
  isCompleted: boolean;
  isTimeUp: boolean;
  candidateInputBlocked: boolean;
  aiCompletionBlocked: boolean;
  isManualEndInProgress: boolean;
}

export interface TimeoutContext {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isAiSpeaking: boolean;
  isListening: boolean;
  candidateInfo: CandidateInfo | null;
  jobInfo: JobInfo | null;
  finalTranscript: string;
  previousQuestion: string;
  completionMessageSent: boolean;
  navigate: any;
  interviewId: string;
  stopRecordingAndUpload: () => Promise<string | null>;
  stopSpeechRecognition: () => void;
  speakText: (text: string, onEnd?: () => void) => void;
  setCandidateInputBlocked: (blocked: boolean) => void;
  setIsCompleted: (completed: boolean) => void;
}

export interface SpeechRecognitionConfig {
  onFinalTranscript: (transcript: string) => void;
  blocked: boolean;
  isTimeUp: boolean;
  isCompleted: boolean;
}