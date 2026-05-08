import React, { useState, useEffect } from "react";
import { CheckCircle, Gift, AlertCircle, Mail, X, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import emailjs from "@emailjs/browser";
import { toast } from "@/components/ui/use-toast";
import PlanSelectionModal from "./PlanSelectionModalProps";

interface InviteCandidateProps {
  jobId: string;
}

interface FormData {
  email: string;
  name: string;
}

declare global {
  interface Window {
    Paddle: any;
  }
}

const INTERVIEW_LIMITS: Record<string, number> = {
  free_trial: 2,
  flex: 4, 
  basic: 6,
  standard: 8, 
  premium: 10, 
};

const InviteCandidate: React.FC<InviteCandidateProps> = ({ jobId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ email: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [planSelectionModalOpen, setPlanSelectionModalOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [currentPlan, setCurrentPlan] = useState<'free_trial' | 'flex' | 'basic' | 'standard' | 'premium'>('free_trial');
  const [interviewUsage, setInterviewUsage] = useState({ used: 0, total: 2 });
  // Add state for flex plan availability
  const [flexPlanAvailableThisMonth, setFlexPlanAvailableThisMonth] = React.useState(true);
  // State to prevent multiple payment processing
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  // Simple Paddle initialization with event listeners
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
  //   script.async = true;
  //   script.onload = () => {
  //     window.Paddle?.Environment?.set("sandbox");
  //     window.Paddle?.Initialize({ token: "test_379519aeb68487ab071685f174f" }); // Replace with your Paddle Sandbox Token
  //   };
  //   document.body.appendChild(script);

  //   // Load stored plan from localStorage
  //   const storedPlan = localStorage.getItem('userPlan');
  //   if (storedPlan && ['free_trial', 'flex', 'basic', 'standard', 'premium'].includes(storedPlan)) {
  //     setCurrentPlan(storedPlan as 'free_trial' | 'flex' | 'basic' | 'standard' | 'premium');
  //   }
  // }, []);


  useEffect(() => {
    // Check if Paddle script is already loaded
    const existingScript = document.querySelector('script[src*="paddle.js"]');
    
    if (existingScript) {
      console.log("Paddle script already loaded, initializing...");
      initializePaddle();
    } else {
      console.log("Loading Paddle script...");
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        console.log("Paddle script loaded, initializing...");
        initializePaddle();
      };
      document.body.appendChild(script);
    }

    // Load stored plan from localStorage
    const storedPlan = localStorage.getItem('userPlan');
    if (storedPlan && ['free_trial', 'flex', 'basic', 'standard', 'premium'].includes(storedPlan)) {
      setCurrentPlan(storedPlan as 'free_trial' | 'flex' | 'basic' | 'standard' | 'premium');
    }

    // Cleanup function
    return () => {
    };
  }, []);

  // Separate function to initialize Paddle
  const initializePaddle = () => {
    try {
      if (window.Paddle) {
        console.log("Initializing Paddle...");
        window.Paddle.Environment.set("production");
        window.Paddle.Initialize({
          token: "live_211c54739d5734b58916bb629a9",

          // Add eventCallback here
          eventCallback: (eventData: any) => {
            console.log("Paddle event:", eventData);

            // Listen for checkout.completed
            if (eventData.name === "checkout.completed") {
              console.log("Payment completed successfully:", eventData);

              // Prevent multiple processing of the same payment
              const selectedPlan = localStorage.getItem("selectedPlan") || "";
              if (selectedPlan && !isProcessingPayment) {
                handlePaymentComplete(eventData, selectedPlan);
              }
            }

            // You can also log errors, cancellations, etc.
            if (eventData.name === "checkout.payment.failed") {
              console.error("Payment failed:", eventData);
            }
          }
        });
        console.log("Paddle initialized successfully");
      } else {
        console.error("Paddle not available");
      }
    } catch (error) {
      console.error("Error initializing Paddle:", error);
    }
  };


  // Fetch current usage and plan
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // First, fetch current plan from new billing system
        const planResponse = await fetch(`${import.meta.env.VITE_API_URL}/company/current-plan`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (planResponse.ok) {
          const planData = await planResponse.json();
          if (planData.success && planData.data) {
            const backendPlan = planData.data.plan;
            // Update localStorage and state with backend plan
            localStorage.setItem('userPlan', backendPlan);
            setCurrentPlan(backendPlan as 'free_trial' | 'flex' | 'basic' | 'standard' | 'premium');

            // Use the usage data from new billing system
            setInterviewUsage({
              used: planData.data.interviewsUsed,
              total: planData.data.interviewLimit
            });
            // Set flex plan availability
            setFlexPlanAvailableThisMonth(planData.data.flexPlanAvailableThisMonth !== false);
            return; // Exit early since we got data from backend
          }
        }

        // Fallback: Fetch candidates to get usage count
        const response = await fetch(`${import.meta.env.VITE_API_URL}/company/candidates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.candidates)) {
            const used = data.candidates.filter((c: any) =>
              c.status === 'Completed' || c.status === 'Scheduled'
            ).length;
            setInterviewUsage({ used, total: INTERVIEW_LIMITS[currentPlan] });
          }
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentPlan]);

  const checkInviteLimit = async (): Promise<{ canInvite: boolean; message?: string }> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Always fetch latest plan/usage from new billing system
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/current-plan`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const { plan, interviewsUsed, interviewLimit } = data.data;
          if (interviewsUsed >= interviewLimit) {
            return {
              canInvite: false,
              message: plan === 'free_trial'
                ? "You've used all 2 interviews from your Free Trial. Please upgrade to Flex Plan to continue inviting candidates."
                : `You've reached your plan limit of ${interviewLimit} interviews. Please upgrade to continue inviting candidates.`
            };
          }
          return { canInvite: true };
        }
      }
      // fallback
      return { canInvite: false, message: "Could not verify interview limit. Please try again." };
    } catch (error) {
      return {
        canInvite: false,
        message: "Error checking invite limit. Please try again."
      };
    }
  };

  // Remove isLimitReached local check from handleInviteButtonClick
  const handleInviteButtonClick = async () => {
    try {
      // Always check backend for latest usage before opening any modal
      const limitCheck = await checkInviteLimit();
      if (limitCheck.canInvite) {
        setIsModalOpen(true); // Only open invite modal if under limit
      } else {
        setLimitMessage(limitCheck.message || "Interview limit reached. Please upgrade to continue.");
        setLimitModalOpen(true); // Always show upgrade modal if at/over limit
        setIsModalOpen(false); // Ensure invite modal is closed
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check invite limits. Please try again.",
        variant: "destructive"
      });
    }
  };

  const closeModal = () => setIsModalOpen(false);
  const closeLimitModal = () => setLimitModalOpen(false);
  const closePlanSelectionModal = () => setPlanSelectionModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Double check limit before making API call
      const limitCheck = await checkInviteLimit();
      if (!limitCheck.canInvite) {
        setLimitMessage(limitCheck.message || "Interview limit reached. Please upgrade your plan.");
        setLimitModalOpen(true);
        closeModal();
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/company/candidates/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            jobApplied: jobId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await emailjs.send(
          "service_a8w0qm4",
          "template_dvqs4xk",
          {
            to_email: formData.email,
            to_name: formData.name,
            password: data.candidate.password,
            interview_link: `${import.meta.env.VITE_FRONTEND_API_URL}/candidate/login/${data.candidate.interview_id}`
          },
          "HpaDPBilQbNexXtH_"
        );

        // Update local usage count
        setInterviewUsage(prev => ({
          ...prev,
          used: prev.used + 1
        }));

        toast({
          title: "Success",
          description: "Candidate invited successfully!",
          variant: "default",
        });
        closeModal();
        setFormData({ email: "", name: "" });
      } else if (response.status === 403) {
        setLimitMessage(data.message || "Interview limit reached. Please upgrade your plan.");
        setLimitModalOpen(true);
        closeModal();
      } else {
        throw new Error(data.message || "Failed to create candidate");
      }
    } catch (error) {
      console.error("Invitation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    setLimitModalOpen(false);
    setPlanSelectionModalOpen(true);
  };

  const handlePlanSelect = (planType: 'flex' | 'basic' | 'standard' | 'premium') => {
    let priceId = "";
    switch (planType) {
      case 'flex': priceId = "pri_01k744ny2yd7pp2q459w3mrba8"; break;
      case 'basic': priceId = "pri_01k7449f3vc04pegf2r8gsvsnq"; break;
      case 'standard': priceId = "pri_01k744kbns52vxxygwrsadp1cy"; break;
      case 'premium': priceId = "pri_01k744rn1e9r2pyfw69y4335j8"; break;
    }

    // Save selected plan locally so we can use it later
    localStorage.setItem("selectedPlan", planType);

    console.log('Opening Paddle checkout for plan:', planType);

    // Check if Paddle is properly initialized
    if (!window.Paddle || !window.Paddle.Checkout) {
      console.error("Paddle not initialized properly");
      toast({
        title: "Error",
        description: "Payment system not ready. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId }]
      });
      setPlanSelectionModalOpen(false);
    } catch (error) {
      console.error("Error opening Paddle checkout:", error);
      toast({
        title: "Error",
        description: "Failed to open payment checkout. Please try again.",
        variant: "destructive",
      });
    }
  };


  // This function will be triggered by eventCallback when checkout.completed fires
  const handlePaymentComplete = async (eventData: any, planType: string) => {
    console.log("Payment completed eventData:", eventData);
  
    if (!planType) {
      console.error("No planType found. Cannot update plan.");
      return;
    }

    // Check if we've already processed this specific transaction
    const processedTransactions = JSON.parse(localStorage.getItem('processedTransactions') || '[]');
    const transactionId = eventData.transaction_id || eventData.id;
    
    // Clean up old transactions (keep only last 50)
    if (processedTransactions.length > 50) {
      processedTransactions.splice(0, processedTransactions.length - 50);
      localStorage.setItem('processedTransactions', JSON.stringify(processedTransactions));
    }
    
    if (transactionId && processedTransactions.includes(transactionId)) {
      console.log("Transaction already processed, skipping...", transactionId);
      return;
    }

    // Prevent multiple processing of the same payment
    if (isProcessingPayment) {
      console.log("Payment already being processed, skipping...");
      return;
    }

    setIsProcessingPayment(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/update-plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType, paddleData: eventData }),
      });
  
      const data = await response.json();
      console.log("Update-plan response:", data);
  
      if (response.ok && data.success) {
        localStorage.setItem('userPlan', planType);
        
        // Mark this transaction as processed
        if (transactionId) {
          processedTransactions.push(transactionId);
          localStorage.setItem('processedTransactions', JSON.stringify(processedTransactions));
        }
        
        // Update usage with new cumulative total from backend
        setInterviewUsage(prev => ({
          used: prev.used, // Keep current usage
          total: data.data.totalInterviews // Use new cumulative total from backend
        }));
  
        toast({
          title: "Payment Successful!",
          description: `You have upgraded to ${planType}. Total interviews: ${data.data.totalInterviews}`,
          variant: "default",
        });
  
        // Clear selected plan from localStorage
        localStorage.removeItem("selectedPlan");
  
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(data.message || "Failed to update plan");
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Payment Successful but Plan Update Failed",
        description: "Your payment was successful, but we could not update your plan. Contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };


  return (
    <div>
      <Button onClick={handleInviteButtonClick}>
        <Mail className="h-4 w-4 mr-2" />
        Invite Candidates
      </Button>

      {/* Invite Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Candidate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter Candidate Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Candidate Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Limit Modal with Upgrade Option */}
    <Dialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
  <DialogContent className="max-w-md py-4">
    <DialogHeader className="text-center">
      <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
        <span role="img" aria-label="lock" className="text-2xl">🔒</span>
        {currentPlan === 'free_trial' ? 'Upgrade from Free Trial' : 'Upgrade Your Plan'}
      </DialogTitle>
    </DialogHeader>

    <div className="py-4 text-center space-y-3">
      {currentPlan === 'free_trial' ? (
        <>
          <div className="space-y-2">
            <p className="text-base font-medium text-primary-600">
              You've used all 2 free interviews!
            </p>
            <p className="text-gray-600 text-xs">
              Great job exploring our platform! Now unlock more potential with our Flex Plan.
            </p>
          </div>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-md p-3 text-left">
            <div className="font-medium text-primary-700 mb-1 text-base">Your Free Trial Journey:</div>
            <div className="space-y-1 text-xs text-primary-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                <span>Free Trial: 2 interviews used</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-600">•</span>
                <span>Ready for Flex Plan (4 interviews)!</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-base font-medium text-primary-600">
              Your plan limit has been reached!
            </p>
            <p className="text-gray-600 text-xs">
              Unlock more interviews and premium features by upgrading your plan.
            </p>
          </div>
        </>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
        <h4 className="font-medium text-gray-900 mb-2 text-base">Upgrade Benefits:</h4>
        <ul className="text-left space-y-1 text-xs text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✔️</span>
            <span>More interview capacity</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✔️</span>
            <span>Advanced AI insights</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✔️</span>
            <span>Priority support</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✔️</span>
            <span>Team collaboration tools</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✔️</span>
            <span>Custom branding options</span>
          </li>
        </ul>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-md p-2 text-primary-800 text-xs">
        <span className="font-semibold">Note:</span> Upgraded plans start immediately — no downtime!
      </div>
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={closeLimitModal}
        className="flex-1 text-sm"
      >
        Maybe Later
      </Button>
      <Button
        onClick={handleUpgradeClick}
        className="flex-1 text-sm"
      >
        Choose Plan
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* Plan Selection Modal - Now using separate component */}
      <PlanSelectionModal
        isOpen={planSelectionModalOpen}
        onClose={closePlanSelectionModal}
        onPlanSelect={(planType) => {
          handlePlanSelect(planType);
          setPlanSelectionModalOpen(false); // Ensure modal closes after selection
        }}
        currentPlan={currentPlan as 'free_trial' | 'flex' | 'basic' | 'standard' | 'premium'}
        flexPlanAvailableThisMonth={flexPlanAvailableThisMonth}
      />
    </div>
  );
};

export default InviteCandidate;