import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Calendar, 
  ArrowUpDown, 
  MoreHorizontal,
  Mail,
  Clock,
  Calendar as CalendarIcon,
  UserPlus,
  Check,
  X,
  Building,
  Users,
  Phone
} from 'lucide-react';

const DemoRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<{field: string, direction: 'asc' | 'desc'}>({
    field: 'date',
    direction: 'desc'
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [demoRequests, setDemoRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDemoRequests = async () => {
      try {
        const token = localStorage.getItem('admin');
        if (!token) {
          toast({
            title: "Error",
            description: "Please login to access this page",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/demo`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            toast({
              title: "Unauthorized",
              description: errorData.message || "Please login again",
              variant: "destructive",
            });
          } else if (response.status === 403) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page",
              variant: "destructive",
            });
          } else {
            throw new Error(errorData.message || 'Failed to fetch demo requests');
          }
          return;
        }

        const data = await response.json();
        setDemoRequests(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch demo requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemoRequests();
  }, [toast]);

  // Filter and sort demo requests
  const filteredRequests = demoRequests
    .filter(request => 
      (request.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
       `${request.firstName} ${request.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.workEmail.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || request.status === filterStatus)
    )
    .sort((a, b) => {
      const field = sortBy.field;
      if (field === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = String(a[field]).toLowerCase();
        const valueB = String(b[field]).toLowerCase();
        return sortBy.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  
  const handleOpenDetails = (request: any) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };
  
  const handleSort = (field: string) => {
    if (sortBy.field === field) {
      setSortBy({
        field,
        direction: sortBy.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortBy({
        field,
        direction: 'asc'
      });
    }
  };
  
  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/demo/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the local state
      setDemoRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: newStatus }
            : request
        )
      );

      toast({
        title: "Status updated",
        description: `Demo request status updated to ${newStatus}.`,
      });
      setOpenDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('admin');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/demo/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      // Update the local state
      setDemoRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );

      toast({
        title: "Request deleted",
        description: "Demo request has been deleted successfully.",
      });
      setOpenDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-gray-500">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const sendEmail = (email: string) => {
    // In a real application, this might open an email client or form
    window.open(`mailto:${email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Demo Requests</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select 
                defaultValue="all" 
                onValueChange={setFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('company')}>
                      Company
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('date')}>
                      Request Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} onClick={() => handleOpenDetails(request)} className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{request.company}</div>
                      <div className="text-xs text-gray-500">
                        {request.companySize} employees
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div className="font-medium">{request.phone || 'No phone number'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenDetails(request)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No demo requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <div>Showing {filteredRequests.length} of {demoRequests.length} requests</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Demo Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Demo Request Details</DialogTitle>
              <DialogDescription>
                Request from {selectedRequest.company} on {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Company Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedRequest.company}</div>
                        <div className="text-sm text-gray-500">
                          {selectedRequest.companySize} employees
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{`${selectedRequest.firstName} ${selectedRequest.lastName}`}</div>
                        <div className="text-sm text-gray-500">{selectedRequest.jobTitle}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedRequest.workEmail}</div>
                        
                      </div>
                    </div>
                    {selectedRequest.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{selectedRequest.phone}</div>
                         
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status {getStatusBadge(selectedRequest.status)}</h3>
                    
                  <div className="flex items-center gap-2">
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Request Details</h3>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <h4 className="font-medium text-sm">What are they looking to accomplish?</h4>
                    <p className="text-sm mt-1">{selectedRequest.needs}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteRequest(selectedRequest._id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'scheduled')}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule Demo
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'completed')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Completed
                  </Button>
                )}
                {(selectedRequest.status === 'declined' || selectedRequest.status === 'completed') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'pending')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Reopen Request
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DemoRequestsPage;
