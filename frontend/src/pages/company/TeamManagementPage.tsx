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
import { Label } from '@/components/ui/label';
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
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal,
  Mail,
  UserX,
  Edit,
  Check,
  X
} from 'lucide-react';
import Loading from '@/components/ui/loading';
import { Spinner } from '@/components/ui/spinner';
import emailjs from '@emailjs/browser';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'interviewer' | 'viewer';
  status: 'active' | 'invited';
  invitedOn?: string;
  lastActive?: string;
}

const TeamManagementPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: '', name: '', role: 'interviewer' });
  const [inviteLoading, setInviteLoading] = useState(false);
  
  useEffect(() => {
    fetchTeamMembers();
    // Initialize EmailJS
    emailjs.init('PC68xGq2t9ivv3MXw');
  }, []);
  
  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        toast({
          title: "Error",
          description: "Please login to access team management.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/team`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
      } else {
        throw new Error(data.message || 'Failed to fetch team members');
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };
  
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Sending invitation request...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/team/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role
        })
      });

      const data = await response.json();
      console.log('Invitation response:', data);

      if (data.success) {
        console.log('Generated password for email:', data.generatedPassword);
        
        // Get company name from token or use default
        let companyName = 'Your Company';
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          companyName = tokenPayload.company_name || 'Your Company';
        } catch (err) {
          console.log('Could not extract company name from token');
        }
        
        // Prepare email template parameters
        const templateParams = {
          to_name: formData.name,
          to_email: formData.email,
          password: data.generatedPassword,
          role: formData.role,
          company_name: companyName,
          login_url: window.location.origin + '/login'
        };

        console.log('Sending email with template params:', templateParams);

        try {
          // Send email via EmailJS
          const emailResult = await emailjs.send(
            'service_mz4y2ep', 
            'template_ja8zj35', 
            templateParams, 
            'PC68xGq2t9ivv3MXw'
          );

          console.log('Email sent successfully:', emailResult);

          toast({
            title: "Success",
            description: `Team member invited successfully! Login credentials sent to ${formData.email}`,
            variant: "default",
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          
          // Still show success for invitation, but mention email issue
          toast({
            title: "Invitation Created",
            description: `Team member invited successfully, but email delivery failed. Password: ${data.generatedPassword}`,
            variant: "destructive",
          });
        }

        closeDialog();
        fetchTeamMembers();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };
  
  const handleResendInvitation = async (memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Resending invitation for member:', memberId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/team/resend/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Resend response:', data);

      if (data.success) {
        console.log('New generated password:', data.generatedPassword);
        
        // Find the team member to get their details
        const member = teamMembers.find(m => m._id === memberId);
        
        if (member) {
          // Get company name from token or use default
          let companyName = 'Your Company';
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            companyName = tokenPayload.company_name || 'Your Company';
          } catch (err) {
            console.log('Could not extract company name from token');
          }

          // Send email via EmailJS with new password
          const templateParams = {
            to_name: member.name,
            to_email: member.email,
            password: data.generatedPassword,
            role: member.role,
            company_name: companyName,
            login_url: window.location.origin + '/login'
          };

          console.log('Resending email with template params:', templateParams);

          try {
            const emailResult = await emailjs.send(
              'service_ynziy5h', 
              'template_5uaolua', 
              templateParams, 
              'dSNtP2lpidtKHJgUW'
            );

            console.log('Resend email sent successfully:', emailResult);

            toast({
              title: "Success",
              description: `New credentials sent to ${member.email}`,
              variant: "default",
            });
          } catch (emailError) {
            console.error('Resend email failed:', emailError);
            
            toast({
              title: "Credentials Updated",
              description: `New password generated but email failed. Password: ${data.generatedPassword}`,
              variant: "destructive",
            });
          }
        }

        fetchTeamMembers();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Resend invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelInvitation = async (memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }


      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/team/cancel/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Cancel response:', data);

      if (data.success) {
        toast({
          title: "Success",
          description: "Invitation cancelled successfully!",
          variant: "default",
        });
        fetchTeamMembers();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Cancel invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const openModal = () => setOpenDialog(true);
  
  const closeDialog = () => {
    setOpenDialog(false);
    setFormData({ email: '', name: '', role: 'interviewer' });
  };
  
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      case 'hr_manager':
        return <Badge className="bg-blue-500 hover:bg-blue-600">HR Manager</Badge>;
      case 'interviewer':
        return <Badge className="bg-green-500 hover:bg-green-600">Interviewer</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusDisplay = (member: TeamMember) => {
    if (member.status === 'active') {
      return (
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          Active
        </div>
      );
    } else if (member.status === 'invited') {
      return (
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
          Invited
        </div>
      );
    }
    return member.status;
  };

  const getLastActiveDisplay = (member: TeamMember) => {
    if (member.status === 'invited') {
      return member.invitedOn 
        ? `Invited ${new Date(member.invitedOn).toLocaleDateString()}`
        : 'Recently invited';
    }
    return member.lastActive 
      ? new Date(member.lastActive).toLocaleDateString()
      : '-';
  };

  if (loading) {
    return <Loading message="Loading team members..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        <Button onClick={openModal}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search team members..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Active</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gray-100">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(member.role)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusDisplay(member)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getLastActiveDisplay(member)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.status === 'invited' && (
                              <>
                                
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleCancelInvitation(member._id)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Cancel Invitation
                                </DropdownMenuItem>
                              </>
                            )}
                            {member.status === 'active' && (
                                 <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleCancelInvitation(member._id)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Delete role
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {teamMembers.length === 0 
                        ? "No team members found. Invite someone to get started!"
                        : "No team members match your search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team. They'll receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={inviteLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  placeholder="john@company.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={inviteLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={inviteLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {/* <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p><strong>Admin:</strong> ss to all features</p>
                  <p><strong>HR Manager:</strong> Can manage jobs and interviews</p>
                  <p><strong>Interviewer:</strong> Can view and rate interviews</p>
                  <p><strong>Viewer:</strong> Can only view interview results</p>
                </div> */}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={closeDialog} 
                disabled={inviteLoading}
                type="button"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagementPage;