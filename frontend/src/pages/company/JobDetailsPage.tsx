import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  Users,
  Star,
  Mail,
  Edit,
  Play,
  ChevronLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import InviteCandidate from './InviteCandidate';

axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}`; // Change this to your actual API URL

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: job?.title || "",
    department: job?.department || "",
    location: job?.location || "",
    description: job?.description || "",
    type: job?.type || "full-time",
  });

  const candidates = [];

  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to view job details",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        const response = await axios.get(`/company/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setJob(response.data.data);
          setEditForm({
            title: response.data.data.title || "",
            department: response.data.data.department || "",
            location: response.data.data.location || "",
            description: response.data.data.description || "",
            type: response.data.data.type || "full-time",
          });
        } else {
          setError('Failed to fetch job details');
          toast({
            title: "Error",
            description: "Failed to fetch job details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching job details:', error);

        let errorMessage = "Failed to fetch job details";

        if (error.response) {
          errorMessage = error.response.data.message || `Server error (${error.response.status})`;

          if (error.response.status === 404) {
            errorMessage = "Job not found or you don't have permission to view it";
          } else if (error.response.status === 401) {
            navigate('/login');
            return;
          }
        } else if (error.request) {
          errorMessage = "Server did not respond. Check your network connection.";
        }

        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);
  // Function to handle job deletion
  const handleDeleteJob = async () => {
    setIsDeleting(true);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete a job",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      console.log(`Attempting to delete job with ID: ${id}`);

      // Make API call to delete the job
      const response = await axios.delete(`/company/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Delete response:', response);

      if (response.data.success) {
          toast({
            title: "Success",
            description: "Job has been successfully deleted",
          });
        // Redirect to jobs list page after successful deletion
        navigate('/company/jobs');
      }
    } catch (error) {
      console.error('Error deleting job:', error);

      let errorMessage = "Failed to delete job";

      if (error.response) {
        errorMessage = error.response.data.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Server did not respond. Check your network connection.";
      } else {
        errorMessage = error.message || "Error preparing the request";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to edit a job",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.put(
        `/company/jobs/${id}`,
        { ...editForm },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
        setJob(response.data.data); // Update the job details
        setIsEditModalOpen(false); // Close the modal
      } else {
        toast({
          title: "Error",
          description: "Failed to update job",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the job",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'interviewed':
        return <Badge className="bg-green-500">Interviewed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'invited':
        return <Badge className="bg-yellow-500">Invited</Badge>;
      case 'applied':
        return <Badge variant="outline">Applied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" className="text-gray-500" />
          <p className="text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800">Unable to load job details</h2>
        <p className="text-gray-600">{error || "Job not found"}</p>
        <Button onClick={() => navigate('/company/jobs')}>
          Back to Jobs List
        </Button>
      </div>
    );
  }

  // Calculate days active
  const daysActive = Math.ceil(
    (new Date().getTime() - new Date(job.createdAt || job.datePosted).getTime()) /
    (1000 * 60 * 60 * 24)
  );

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              {job.department}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Posted on {new Date(job.createdAt || job.datePosted).toLocaleDateString()}
            </div>
            <Badge className={job.status === 'active' ? 'bg-green-500' : ''}>
              {job.status === 'active' ? 'Active' : job.status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
          <InviteCandidate jobId={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <Tabs defaultValue="description">
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="description">Job Description</TabsTrigger>
                {/* <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger> */}
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="description">
                <div dangerouslySetInnerHTML={{ __html: job.description }} className="prose max-w-none" />

                <div className="mt-10">
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills && job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="candidates">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-xs text-gray-500">{candidate.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getStatusBadge(candidate.status)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {candidate.score ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span>{candidate.score}%</span>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {candidate.status === 'interviewed' && (
                                <Button size="sm" variant="outline">
                                  <Play className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              )}
                              {candidate.status === 'invited' && (
                                <Button size="sm" variant="outline">
                                  Remind
                                </Button>
                              )}
                              {candidate.status === 'applied' && (
                                <Button size="sm">
                                  Invite
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Job Visibility</h4>
                    <p className="text-gray-600">
                      This job is currently <span className="font-medium text-green-600">{job.status || 'active'}</span> and visible to invited candidates.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Close Job</Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Job
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Interview Settings</h4>
                    <p className="text-gray-600">
                      Current interview duration: <span className="font-medium">{job.interviewDuration || '45 minutes'}</span>
                    </p>
                    <p className="text-gray-600">
                      Questions: <span className="font-medium">{job.questionCount || '24 questions'}</span>
                      {job.technicalQuestions && job.behavioralQuestions ?
                        ` (${job.technicalQuestions} technical, ${job.behavioralQuestions} behavioral)` :
                        ' (15 technical, 9 behavioral)'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">Customize Interview</Button>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Total Applicants</span>
                  </div>
                  <span className="font-medium">{job.applicants || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Interviews Complete</span>
                  </div>
                  <span className="font-medium">{job.interviews || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Days Active</span>
                  </div>
                  <span className="font-medium">{daysActive}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidates
                  .filter(c => c.score)
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .slice(0, 3)
                  .map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{candidate.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{candidate.score}%</span>
                      </div>
                    </div>
                  ))}
                {candidates.filter(c => c.score).length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No candidates have completed interviews yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Job
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone
              and will remove the job from your company's listings.
              All candidate data associated with this job will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
     
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                className="mt-1 block w-full rounded-md border-black p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={editForm.department}
                onChange={handleEditChange}
                className="mt-1 p-2 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
                className="mt-1 p-2 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                value={editForm.type}
                onChange={handleEditChange}
                className="mt-1 p-2 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                className="mt-1 p-2 block w-full rounded-md border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>
    </div>
  );
};

export default JobDetailsPage;