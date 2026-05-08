import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MarketingLayout from "@/layouts/MarketingLayout";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{ name?: string; email?: string }>({});
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real-time validation (similar to login page)
  useEffect(() => {
    const isNewPasswordValid = newPassword.length >= 6;
    const isConfirmPasswordValid = confirmPassword.length >= 6;

    setNewPasswordError(
      isNewPasswordValid || newPassword.length === 0
        ? ""
        : "Password must be at least 6 characters"
    );

    setConfirmPasswordError(
      isConfirmPasswordValid || confirmPassword.length === 0
        ? ""
        : "Password must be at least 6 characters"
    );

    setIsFormValid(isNewPasswordValid && isConfirmPasswordValid && newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setTokenValid(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-reset-token/${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setTokenValid(true);
          setCompanyInfo(data.data);
        } else {
          setTokenValid(false);
          toast({
            title: "Invalid Link",
            description: data.message || "This reset link is invalid or has expired.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenValid(false);
        toast({
          title: "Error",
          description: "Failed to verify reset link. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, toast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!isFormValid) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token, 
          newPassword, 
          confirmPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "Your password has been reset successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <MarketingLayout>
        <div className="flex min-h-screen bg-white justify-center">
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying reset link...</p>
            </div>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <MarketingLayout>
        <div className="flex min-h-screen bg-white justify-center">
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-gray-600 mb-8">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <div className="space-y-4">
                <Link to="/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <MarketingLayout>
        <div className="flex min-h-screen bg-white justify-center">
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Password Reset Successfully!
              </h1>
              <p className="text-gray-600 mb-8">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  // Main reset password form
  return (
    <MarketingLayout>
      <div className="flex min-h-screen bg-white justify-center">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600">
                Enter your new password for{" "}
                <span className="font-medium text-gray-900">
                  {companyInfo.name || companyInfo.email}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    error={!!newPasswordError}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPasswordError && (
                  <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    error={!!confirmPasswordError}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>

            <div className="text-center mt-8">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
};

export default ResetPasswordPage;