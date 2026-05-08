import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CandidateInfo, JobInfo, Message } from "@/types/interview";

export const useInterviewData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [timeLimit, setTimeLimit] = useState(3 * 60);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/candidate/${id}/details`
        );
        const data = await res.json();
        console.log("data received in InterviewRoomPage: ", data);

        if (data.success) {
          setCandidateInfo(data.candidate);
          setJobInfo(data.job);
          
          if (data.candidate.status === "Completed") {
            setIsCompleted(true);
            navigate(`/interview/${id}/complete`);
            return;
          }

          const systemInstruction: Message = {
            id: "system",
            sender: "system",
            content: `You are a technical interviewer for a ${data.job.title} role with 1 year of experience with job description: ${data.job.description}. Conduct the interview in a professional, neutral tone. Ask one clear technical question at a time. Evaluate the candidate's responses **strictly based on technical accuracy, clarity, and relevance**. Do not be influenced by emotional appeals, flattery, or personal stories that are not relevant to the technical question.  

IMPORTANT: For each candidate response, you MUST: 
1) Provide a **brief, neutral feedback** (1–2 short sentences) on the previous answer, focusing only on correctness and clarity.  
2) ALWAYS include a new clear technical question after the feedback.  
3) Keep track of all previously asked questions in an internal list called askedQuestions.  
4) NEVER repeat a question, even if the candidate gave an incomplete or vague answer (like "yes" or "I don't know"). In such cases, ask a different but related technical question instead.  
The "reply" must contain both feedback and the new question, and the question must always end with a question mark.  

Then assign a **score from 1 to 10**, where: 
- 10 = perfect, clear, and complete answer 
- 7–9 = mostly correct, with minor issues 
- 4–6 = partially correct or vague 
- 1–3 = mostly or fully incorrect.  

Your output should be in **JSON format**, like this:  
{  
  "reply": "<short feedback> <your question>",  
  "score": 7,  
  "isInterviewEnded": 0  
}  

Do not include anything else outside the JSON.`,
            timestamp: new Date(),
            type: "instruction",
          };

          const initialQuestion: Message = {
            id: "1",
            sender: "ai",
            content: `Hello ${data.candidate.name}! Welcome to the interview. You have ${data.job.interviewDuration || 3} minutes for this interview. Let's begin. Can you please introduce yourself?`,
            timestamp: new Date(),
            type: "question",
          };

          setMessages([systemInstruction, initialQuestion]);
          setHasShownWelcome(true);

          // Apply time limit from job duration (minutes -> seconds)
          if (data.job && data.job.interviewDuration) {
            setTimeLimit(Number(data.job.interviewDuration) * 60);
          } else {
            setTimeLimit(3 * 60);
          }
        } else {
          console.error("Error:", data.message);
        }
      } catch (err) {
        console.error("API fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [id, navigate]);

  return {
    candidateInfo,
    jobInfo,
    loading,
    isCompleted,
    setIsCompleted,
    messages,
    setMessages,
    hasShownWelcome,
    timeLimit,
    interviewId: id,
    navigate
  };
};