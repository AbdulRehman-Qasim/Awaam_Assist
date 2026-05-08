import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  Briefcase, 
  Users, 
  Search, 
  PlusCircle
} from 'lucide-react';
import Loading from '@/components/ui/loading';

const JobsListingPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
 
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
    
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your jobs.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/company/jobs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        

        if (response.status === 401) {
          localStorage.removeItem('token');
          toast({
            title: "Session Expired",
            description: "Your login session has expired. Please log in again.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
         
          const formattedJobs = data.data.map(job => ({
            id: job._id,
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            status: 'active', 
            datePosted: new Date(job.createdAt).toISOString().split('T')[0],
            applicants: 0, // Default for now
            interviews: 0, // Default for now
            skills: job.skills || []
          }));
          
          setJobs(formattedJobs);
        } else {
          setError(data.message || 'Failed to fetch jobs');
          toast({
            title: "Error",
            description: data.message || "Failed to fetch jobs",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Connection error. Please check your internet connection.');
        toast({
          title: "Connection Error",
          description: "Failed to connect to server. Please check your connection and try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [toast, navigate]);
  
  // Filter and search jobs
  const filteredJobs = jobs.filter(job => {
    // Apply status filter
    const statusMatch = filter === 'all' || job.status === filter;
    
    // Apply search query
    const searchMatch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });
    
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'closed':
        return <Badge variant="outline" className="text-gray-500">Closed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatEmploymentType = (type) => {
    // Convert "full-time" to "Full-time" etc.
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('-');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <Link to="/company/jobs/create">
          <Button >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Job
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search jobs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                defaultValue="all" 
                onValueChange={setFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading jobs..." />
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-destructive">
              <p>{error}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Posted</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <Link to={`/company/jobs/${job.id}`} className="hover:text-primary-600">
                          {job.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                          {job.department}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {job.location}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(job.datePosted).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          {job.applicants}
                          <span className="mx-1 text-gray-500">/</span>
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          {job.interviews}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredJobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No jobs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between w-full text-xs text-gray-500">
            <div>
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-3">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-3">
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobsListingPage;