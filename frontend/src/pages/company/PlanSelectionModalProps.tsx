import React, { useState } from "react";
import { Check, Crown, Zap, Star, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (planType: 'flex' | 'basic' | 'standard' | 'premium') => void;
  currentPlan: 'free_trial' | 'flex' | 'basic' | 'standard' | 'premium';
  flexPlanAvailableThisMonth?: boolean;
}

const INTERVIEW_LIMITS: Record<string, number> = {
  free_trial: 2,
  flex: 4,
  basic: 6,
  standard: 8,
  premium: 10, // Premium: 10 interviews for premium
};

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onPlanSelect,
  currentPlan,
  flexPlanAvailableThisMonth = true
}) => {

  // Helper to determine next recommended plan
  const getRecommendedPlan = (currentPlan: string) => {
    switch (currentPlan) {
      case 'free_trial': return 'flex';
      case 'flex': return 'basic';
      case 'basic': return 'standard';
      case 'standard': return 'premium';
      default: return '';
    }
  };
  const recommendedPlan = getRecommendedPlan(currentPlan);

  // Demo function for testing without payment
  const handleDemoUpgrade = async (planType: 'flex' | 'basic' | 'standard' | 'premium') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Call backend API to update plan
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/update-plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('userPlan', planType);
          localStorage.setItem('planJustUpgraded', 'true');
          toast({
            title: " Demo Upgrade Successful!",
            description: `You've upgraded to ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan.`,
            variant: "default",
          });
          onClose(); // Always close modal after upgrade
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to update plan');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update plan on server');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="max-w-[95vw] m-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mt-4 mb-2">
          <DialogTitle className="text-center text-2xl font-bold">
            {currentPlan === 'free_trial' ? 'Choose Your Plan' : 'Upgrade Your Plan'}
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            {currentPlan === 'free_trial'
              ? 'You\'ve completed your free trial! Select a plan to continue hiring amazing candidates.'
              : 'Select a better plan for your hiring needs'
            }
          </p>
        </DialogHeader>

        <div>
          {/* Free Trial Summary (only show if user is on free_trial) */}
          {currentPlan === 'free_trial' && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <h3 className="font-semibold text-blue-700 mb-2">Free Trial Completed!</h3>
                <p className="text-sm text-blue-600 mb-2">
                  You've successfully used all <strong>2 interviews</strong> from your Free Trial
                </p>
                <p className="text-xs text-blue-500">
                  It is Time to unlock your hiring potential with a paid plan!
                </p>
              </div>
            </div>
          )}

<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${flexPlanAvailableThisMonth ? 4 : 3}, 1fr)` }}>


            {/* Flex Plan */}
            {flexPlanAvailableThisMonth && (
              <div className="border-2 border-primary-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer relative bg-gradient-to-br from-primary-50 to-primary-100 my-3">
                {recommendedPlan === 'flex' && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-2 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
                    Recommended
                  </div>
                )}
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <Layers className="h-10 w-10 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Flex Plan</h3>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-primary-600">$29</span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 italic">
                    Perfect next step after your free trial. Great for small teams.
                  </p>

                  <ul className="text-left space-y-2 mb-4 text-xs">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span>Up to 4 interviews/month</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span>AI feedback</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span>Email support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span>1 team member</span>
                    </li>
                  </ul>

                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Flex Plan Activated',
                          description: 'We are giving you the Flex Plan for this month. You can get it again on the same date next month.',
                          variant: 'default',
                        });
                        onPlanSelect('flex');
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm"
                    >
                      Pay with Paddle
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Flex Plan Activated',
                          description: 'We are giving you the Flex Plan for this month. You can get it again on the same date next month.',
                          variant: 'default',
                        });
                        handleDemoUpgrade('flex');
                      }}
                      variant="outline"
                      className="w-full text-xs border-primary-300 text-primary-600 hover:bg-primary-50"
                    >
                      Demo Upgrade (Free)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Plan */}
            <div className="border-2 border-primary-300 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer relative bg-gradient-to-br from-primary-50 to-primary-100 my-3">
              {recommendedPlan === 'basic' && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-2 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
                  Recommended
                </div>
              )}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Star className="h-10 w-10 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Plan</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-primary-600">$49</span>
                  <span className="text-gray-600 text-sm">/month</span>
                </div>

                <ul className="text-left space-y-2 mb-4 text-xs">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Up to 50 interviews/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Basic interview templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Email support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Up to 3 team members</span>
                  </li>
                </ul>

                <div className="space-y-2">
                  <Button
                    onClick={() => onPlanSelect('basic')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm"
                  >
                    Pay with Paddle
                  </Button>
                  <Button
                    onClick={() => handleDemoUpgrade('basic')}
                    variant="outline"
                    className="w-full text-xs border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    Demo Upgrade (Free)
                  </Button>
                </div>
              </div>
            </div>

            {/* Standard Plan */}
            <div className="border-2 border-primary-300 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer relative bg-gradient-to-br from-primary-50 to-primary-100 my-3">
              {(recommendedPlan === 'standard') && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-2 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
                  Recommended
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Zap className="h-10 w-10 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Standard Plan</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-primary-600">$149</span>
                  <span className="text-gray-600 text-sm">/month</span>
                </div>

                <ul className="text-left space-y-2 mb-4 text-xs">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Up to 200 interviews/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Advanced interview templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Up to 5 team members</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Custom branding</span>
                  </li>
                </ul>

                <div className="space-y-2">
                  <Button
                    onClick={() => onPlanSelect('standard')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm"
                  >
                    Pay with Paddle
                  </Button>
                  <Button
                    onClick={() => handleDemoUpgrade('standard')}
                    variant="outline"
                    className="w-full text-xs border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    Demo Upgrade (Free)
                  </Button>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-primary-300 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer relative bg-gradient-to-br from-primary-50 to-primary-100 my-3">
              {(recommendedPlan === 'premium') && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-2 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
                  Recommended
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Crown className="h-10 w-10 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Plan</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-primary-600">$349</span>
                  <span className="text-gray-600 text-sm">/month</span>
                </div>

                <ul className="text-left space-y-2 mb-4 text-xs">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Unlimited interviews</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>All interview templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>24/7 Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Premium analytics & AI insights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Full custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>API access & integrations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>

                <div className="space-y-2">
                  <Button
                    onClick={() => onPlanSelect('premium')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg text-sm"
                  >
                    Pay with Paddle
                  </Button>
                  <Button
                    onClick={() => handleDemoUpgrade('premium')}
                    variant="outline"
                    className="w-full text-xs border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    Demo Upgrade (Free)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-3">All Plans Include:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Secure candidate data encryption</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>GDPR compliant data handling</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Mobile-friendly interface</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Real-time notifications</span>
                </div>
              </div>
            </div>

            {/* Special offer for trial users */}
            {currentPlan === 'free_trial' && (
              <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-700">
                  <strong>Special Trial Graduate Offer:</strong> Get 10% off your first month with any paid plan!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Discount automatically applied at checkout
                </p>
              </div>
            )}

            {/* Demo Notice */}
            <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-700">
                <strong>Demo Mode:</strong> Use "Demo Upgrade" buttons to test plan changes without payment!
              </p>
              <p className="text-xs text-primary-600 mt-1">
                Perfect for testing — your plan will update immediately
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 mb-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionModal;