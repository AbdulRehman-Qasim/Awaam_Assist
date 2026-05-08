import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const CandidateLoginPage = () => {
  const { token } = useParams(); // token is interview_id
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/candidate/${token}`);
        const data = await res.json();
        if (data.success) {
          setCandidateName(data.candidate.name);
          if (data.candidate.status === 'Completed') {
            setIsCompleted(true);
          } else {
            // Check if candidate is already logged in with this interview
            const existingToken = localStorage.getItem('candidateToken');
            const existingData = localStorage.getItem('candidateData');
            
            if (existingToken === token && existingData) {
              // Already logged in, redirect to preparation
              navigate(`/interview/${token}/prepare`);
              return;
            }
          }
        } else {
          toast({ title: 'Error', description: data.message, variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load interview details.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchCandidate();
  }, [token, toast, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isCompleted) {
        toast({
          title: 'Interview already completed',
          description: 'You have already completed this interview. Please wait for results.',
          variant: 'destructive'
        });
        navigate(`/interview/${token}/complete`);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/candidate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_id: token,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.success) {
        // Set candidate token for authentication
        localStorage.setItem('candidateToken', data.candidate.interview_id);
        localStorage.setItem('candidateData', JSON.stringify(data.candidate));
        
        toast({
          title: "Successfully logged in",
          description: "Redirecting to interview preparation...",
        });
        navigate(`/interview/${token}/prepare`);
      } else {
        toast({
          title: "Login failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading Interview Details</CardTitle>
            <CardDescription>Please wait while we verify your interview invitation...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Candidate Interview Login</CardTitle>
          <CardDescription>
            {isCompleted
              ? 'Congratulations! Your interview has been successfully completed.'
              : `Welcome ${candidateName}. Please verify your credentials to start the interview.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isCompleted ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Interview Already Completed</h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  Thank you for completing your interview. Our team is reviewing your responses and will be in touch with the results soon.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">What happens next?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We'll send you an email with your results within 2-3 business days. Please keep an eye on your inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="consent" required />
                <Label htmlFor="consent" className="text-sm">
                  I consent to having this interview recorded and analyzed
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Start Interview Process'}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-xs text-center text-gray-500 px-6">
            By proceeding, you agree to our Terms of Service and Privacy Policy. This interview may be recorded for evaluation purposes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CandidateLoginPage;