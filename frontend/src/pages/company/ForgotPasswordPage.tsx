import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MarketingLayout from "@/layouts/MarketingLayout";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import emailjs from "@emailjs/browser";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  
  const { toast } = useToast();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate email
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      console.log('Sending forgot password request for:', email);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Forgot password response:', data);

      if (response.ok && data.success) {
       
        try {
          await emailjs.send(
            "service_a8w0qm4", 
            "template_j0ujkyv", 
            {
              to_email: email,
              to_name: data.data?.name || "User", 
              reset_link: data.data?.resetLink,
             
            },
            "HpaDPBilQbNexXtH_" 
          );
          
          setIsSuccess(true);
          toast({
            title: "Reset Link Sent!",
            description: `We've sent a password reset link to ${email}`,
          });
          
          console.log('=================================');
          console.log('PASSWORD RESET EMAIL SENT TO:');
          console.log('Email:', email);
          console.log('Reset Link:', data.data?.resetLink);
          console.log('=================================');
          
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          toast({
            title: "Error",
            description: "Failed to send reset email. Please try again.",
            variant: "destructive",
          });
        }
        
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset link. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                Check your email
              </h1>
              <p className="text-gray-600 mb-2">
                We've sent a password reset link to{" "}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Try again
                </Button>
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

  // Main forgot password form
  return (
    <MarketingLayout>
      <div className="flex min-h-screen bg-white justify-center">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot your password?
              </h1>
              <p className="text-gray-600">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={!!errors.email}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || isLoading}
              >
                {isLoading ? "Sending..." : "Send reset link"}
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

export default ForgotPasswordPage;