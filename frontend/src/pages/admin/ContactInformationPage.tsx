import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  ArrowUpDown, 
  MoreHorizontal,
  Building,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';

const ContactInformationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [sortBy, setSortBy] = useState<{field: string, direction: 'asc' | 'desc'}>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  
  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contacts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }

        const data = await response.json();
        
        if (data.success) {
          setContacts(data.data);
        } else {
          throw new Error(data.message || 'Failed to load contacts');
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch contacts from server",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter(contact => 
      (contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (contact.companyName && contact.companyName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterStatus === 'all' || contact.status === filterStatus) &&
      (filterTopic === 'all' || contact.topic === filterTopic)
    )
    .sort((a, b) => {
      const field = sortBy.field;
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle date sorting
      if (field === 'createdAt' || field === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortBy.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  const handleOpenDetails = (contact: any) => {
    setSelectedContact(contact);
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Unread':
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unread
          </Badge>
        );
      case 'Read':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Read
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTopicBadge = (topic: string) => {
    const topicColors = {
      'admission': 'bg-blue-500',
      'merit': 'bg-green-500',
      'fees': 'bg-yellow-500',
      'discipline': 'bg-purple-500',
      'partnership': 'bg-indigo-500'
    };
    
    const topicLabels = {
      'admission': 'Admission Inquiry',
      'merit': 'Merit Question',
      'fees': 'Fee Structure',
      'discipline': 'Discipline Information',
      'partnership': 'University Partnership'
    };
    
    return (
      <Badge className={topicColors[topic] || 'bg-gray-500'}>
        {topicLabels[topic] || topic}
      </Badge>
    );
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update contact status');
      }

      const data = await response.json();

      if (data.success) {
        // Update the local state
        setContacts(contacts.map(contact => 
          contact._id === contactId 
            ? { ...contact, status: newStatus, updatedAt: new Date().toISOString() } 
            : contact
        ));
        
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus, updatedAt: new Date().toISOString() });
        }
        
        toast({
          title: "Status Updated",
          description: data.message,
        });
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update contact status",
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setContacts(contacts.filter(contact => contact._id !== contactId));
        setOpenDialog(false);
        
        toast({
          title: "Contact Deleted",
          description: data.message,
        });
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact",
      });
    }
  };

  // Show loading animation while fetching contacts
  if (loading) {
    return (
      <div className="relative h-64">
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contact Information</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search contacts..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Unread">Unread</SelectItem>
                  <SelectItem value="Read">Read</SelectItem>
                  {/* <SelectItem value="resolved">Read</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Select 
                defaultValue="all" 
                onValueChange={setFilterTopic}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="admission">Admission Inquiry</SelectItem>
                  <SelectItem value="merit">Merit Question</SelectItem>
                  <SelectItem value="fees">Fee Structure</SelectItem>
                  <SelectItem value="discipline">Discipline Information</SelectItem>
                  <SelectItem value="partnership">University Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('firstName')}>
                      Contact
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id} onClick={() => handleOpenDetails(contact)} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{contact.firstName.charAt(0)}{contact.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                          <div className="text-xs text-gray-500">
                            {contact.companyName && `${contact.companyName} • `}{contact.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTopicBadge(contact.topic)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contact.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(contact);
                          }}>View details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(contact._id, 'Read');
                          }}>Mark as Read</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(contact._id, 'Unread');
                          }}>Mark as Unread</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact._id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No contacts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <div>Showing {filteredContacts.length} of {contacts.length} contacts</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Contact Details Dialog */}
      {selectedContact && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{selectedContact.firstName.charAt(0)}{selectedContact.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedContact.firstName} {selectedContact.lastName} - Contact Details
              </DialogTitle>
              <DialogDescription>
                Complete contact submission details and information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{selectedContact.firstName} {selectedContact.lastName}</div>
                          <div className="text-sm text-gray-500">Full Name</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{selectedContact.email}</div>
                          <div className="text-sm text-gray-500">Email Address</div>
                        </div>
                      </div>

                      {selectedContact.companyName && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                          <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">{selectedContact.companyName}</div>
                            <div className="text-sm text-gray-500">Student Name</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <MessageSquare className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{getTopicBadge(selectedContact.topic)}</div>
                          <div className="text-sm text-gray-500">Inquiry Topic</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Status & Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{getStatusBadge(selectedContact.status)}</div>
                          <div className="text-sm text-gray-500">Current Status</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(selectedContact.createdAt).toLocaleDateString()} at {new Date(selectedContact.createdAt).toLocaleTimeString()}
                          </div>
                          <div className="text-sm text-gray-500">Submitted on</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(selectedContact.updatedAt).toLocaleDateString()} at {new Date(selectedContact.updatedAt).toLocaleTimeString()}
                          </div>
                          <div className="text-sm text-gray-500">Last updated</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Message</h3>
                <div className="p-4 bg-gray-50 rounded-md border">
                  <div className="whitespace-pre-wrap text-gray-900">{selectedContact.message}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                 
                  
                  <Button variant="outline" size="sm" onClick={() => {
                    handleUpdateStatus(selectedContact._id, 'Read');
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => {
                    handleUpdateStatus(selectedContact._id, 'Unread');
                  }}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Mark as Unread
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => handleDeleteContact(selectedContact._id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContactInformationPage;