import { TimeoutContext, Message } from "@/types/interview";

export const timeoutService = {
  determineScenario: (context: {
    isAiSpeaking: boolean;
    isListening: boolean;
    hasSubmitted: boolean;
  }) => {
    if (context.isAiSpeaking) return "ai_speaking";
    if (context.isListening || !context.hasSubmitted) return "candidate_responding";
    return "default";
  },

  handleAiSpeakingTimeUp: async (context: TimeoutContext) => {
    console.log("Time up - AI is speaking, allowing completion");
    
    context.setCandidateInputBlocked(true);

    // Wait for AI to complete speaking
    const waitForAiCompletion = () => {
      return new Promise<void>((resolve) => {
        const checkAiStatus = () => {
          if (!context.isAiSpeaking) {
            resolve();
          } else {
            setTimeout(checkAiStatus, 100);
          }
        };
        checkAiStatus();
      });
    };

    await waitForAiCompletion();

    const completionMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      content: "Your interview time has been completed. Please let me finish my response completely. We are now completing the interview and I will not ask you any further questions.",
      timestamp: new Date(),
      type: "question",
    };

    context.setMessages((prev) => [...prev, completionMessage]);

    await new Promise<void>((resolve) => {
      context.speakText(completionMessage.content, () => {
        resolve();
      });
    });

    await timeoutService.finalizeInterview(context, "ai_speaking_timeout");
  },

  handleCandidateRespondingTimeUp: async (context: TimeoutContext) => {
    console.log("Time up - Candidate is responding, allowing completion");

    // Wait for candidate completion logic would go here
    // This is simplified - you'd need to implement the full logic from original

    context.setCandidateInputBlocked(true);
    context.stopSpeechRecognition();

    const completionMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      content: "Your interview time has been completed. We are now completing the interview. You cannot speak or respond anymore.",
      timestamp: new Date(),
      type: "question",
    };

    context.setMessages((prev) => [...prev, completionMessage]);

    await new Promise<void>((resolve) => {
      context.speakText(completionMessage.content, () => {
        resolve();
      });
    });

    await timeoutService.finalizeInterview(context, "candidate_responding_timeout");
  },

  handleManualEndCall: async (context: TimeoutContext) => {
    console.log("=== MANUAL END INTERVIEW BUTTON CLICKED ===");

    context.setCandidateInputBlocked(true);
    context.stopSpeechRecognition();

    const completionMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      content: "Thank you for your time! The interview has been ended. Your responses have been recorded and will be reviewed by our team.",
      timestamp: new Date(),
      type: "question",
    };

    context.setMessages((prev) => [...prev, completionMessage]);

    if (context.isAiSpeaking) {
      const waitForAiCompletion = () => {
        return new Promise<void>((resolve) => {
          let checkCount = 0;
          const maxChecks = 100;

          const checkAiStatus = () => {
            checkCount++;
            if (!context.isAiSpeaking || checkCount >= maxChecks) {
              resolve();
            } else {
              setTimeout(checkAiStatus, 100);
            }
          };
          checkAiStatus();
        });
      };

      await waitForAiCompletion();
    }

    await new Promise<void>((resolve) => {
      context.speakText(completionMessage.content, () => {
        resolve();
      });
    });

    context.setIsCompleted(true);
    await timeoutService.finalizeInterview(context, "manual_end");
  },

  handleDefaultTimeUp: async (context: TimeoutContext) => {
    console.log("Default time up scenario");

    context.stopSpeechRecognition();
    context.setIsCompleted(true);

    // const timeUpMessage: Message = {
    //   id: Date.now().toString(),
    //   sender: "ai",
    //   content: "Thank you for your time! The interview duration has been completed. Your responses have been recorded and will be reviewed by our team.",
    //   timestamp: new Date(),
    //   type: "question",
    // };

    // context.setMessages((prev) => [...prev, timeUpMessage]);

    // await new Promise<void>((resolve) => {
    //   context.speakText(timeUpMessage.content, () => {
    //     resolve();
    //   });
    // });

    await timeoutService.finalizeInterview(context, "default_timeout");
  },

  finalizeInterview: async (context: TimeoutContext, scenario: string) => {
    try {
      console.log(`Starting finalization for scenario: ${scenario}`);

      const videoUrl = await context.stopRecordingAndUpload();
      console.log("Video upload completed, video URL:", videoUrl);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const finalVideoUrl = videoUrl || "";

      // Try multiple endpoints for finalization
      const possibleEndpoints = [
        `${import.meta.env.VITE_API_URL}/interview/finalize`,
        `${import.meta.env.VITE_API_URL}/interview/complete`,
      ];

      let finalizationSuccess = false;

      for (const endpoint of possibleEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateId: context.candidateInfo?._id,
              jobId: context.jobInfo?._id,
              recordingLink: finalVideoUrl,
            }),
          });

          if (response.ok) {
            console.log(`Interview finalization successful with endpoint: ${endpoint}`);
            finalizationSuccess = true;
            break;
          }
        } catch (endpointErr) {
          console.log(`Endpoint ${endpoint} failed with error:`, endpointErr);
        }
      }

      if (finalizationSuccess) {
        context.navigate(`/interview/${context.interviewId}/complete`);
      } else {
        console.log("All finalization endpoints failed, navigating anyway");
        context.navigate(`/interview/${context.interviewId}/complete`);
      }
    } catch (error) {
      console.error(`Error in ${scenario} interview handling:`, error);
      context.navigate(`/interview/${context.interviewId}/complete`);
    }
  }
};