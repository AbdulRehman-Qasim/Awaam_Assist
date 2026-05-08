import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreateJobPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [department, setDepartment] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [interviewDuration, setInterviewDuration] = useState<number>(2);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a job posting.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills((prevSkills) => [...prevSkills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prevSkills) =>
      prevSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get token and validate
    const token = localStorage.getItem("token");
    console.log("Token available:", token ? "Yes" : "No");

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You need to log in first",
        variant: "destructive",
      });
      navigate("/login");
      setIsSubmitting(false);
      return;
    }

    // Prepare job data using state values directly
    const jobData = {
      title,
      department,
      location,
      type: employmentType,
      description,
      skills: skills,
      interviewDuration: interviewDuration,
    };

    console.log("Skills before sending:", skills);
    console.log("Job data being sent:", jobData);

    // Validate required fields
    if (
      !jobData.title ||
      !jobData.department ||
      !jobData.location ||
      !jobData.type ||
      !jobData.description
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check the authorization header format
      const authHeader = `Bearer ${token}`;

      // Make API request to create job
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/company/jobs/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(jobData),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        toast({
          title: "Session Expired",
          description: "Your login session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (data.success) {
        toast({
          title: "Success!",
          description: "Job created successfully!",
        });
        navigate("/company/jobs");
      } else {
        toast({
          title: "Error",
          description:
            data.message || "Failed to create job. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Connection Error",
        description:
          "Failed to connect to server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/company/jobs">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Create New Job</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
         <form onSubmit={handleSubmit} className="space-y-6">
  {/* Title + Department */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="title">Job Title</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Frontend Developer"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="department">Department</Label>
      <Select onValueChange={setDepartment} value={department}>
        <SelectTrigger id="department">
          <SelectValue placeholder="Select department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="hr">HR</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Location + Employment Type */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g., Remote, San Francisco, CA"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="type">Employment Type</Label>
      <Select onValueChange={setEmploymentType} value={employmentType}>
        <SelectTrigger id="type">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full-time">Full Time</SelectItem>
          <SelectItem value="part-time">Part Time</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Job Description */}
<div className="space-y-2">
  <Label htmlFor="description">Job Description</Label>
  <div className="h-44">
    <ReactQuill
      id="description"
      value={description}
      onChange={setDescription}
      className="h-36"
      placeholder="Describe the job responsibilities, requirements, and qualifications..."
      theme="snow"
    />
  </div>
</div>


  {/* Interview Duration (moved below) */}
  <div className="space-y-2">
    <Label htmlFor="interviewDuration">Interview Duration</Label>
    <Select
      onValueChange={(value) => setInterviewDuration(Number(value))}
      value={interviewDuration.toString()}
    >
      <SelectTrigger id="interviewDuration">
        <SelectValue placeholder="Select duration" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2">2 minutes</SelectItem>
        <SelectItem value="3">3 minutes</SelectItem>
        <SelectItem value="4">4 minutes</SelectItem>
        <SelectItem value="5">5 minutes</SelectItem>
        <SelectItem value="6">6 minutes</SelectItem>
        <SelectItem value="7">7 minutes</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Required Skills (moved below) */}
  <div className="space-y-2">
    <Label>Required Skills</Label>
    <div className="flex gap-2">
      <Input
        value={currentSkill}
        onChange={(e) => setCurrentSkill(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., React, TypeScript, Project Management"
      />
      <Button type="button" onClick={handleAddSkill}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>

    {skills.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="bg-primary-50 text-primary-800 text-sm px-2 py-1 rounded-md flex items-center"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="ml-1 hover:text-primary-900"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Interview Questions Info */}
  <div className="space-y-2">
    <Label htmlFor="interviewQuestions">Interview Questions</Label>
    <p className="text-sm text-gray-500">
      Our AI will generate appropriate questions based on the job
      description and skills you've listed. You can customize them
      after creating the job.
    </p>
  </div>

  {/* Actions */}
  <div className="border-t pt-6 flex justify-end gap-3">
    <Button
      variant="outline"
      type="button"
      onClick={() => navigate("/company/jobs")}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Creating..." : "Create Job"}
    </Button>
  </div>
</form>

        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJobPage;
