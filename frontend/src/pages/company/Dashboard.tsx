import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

// Charts
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Icons
import { FileText, Calendar, UserPlus, Clock, Users, ArrowRight, Star } from 'lucide-react';
import Loading from '@/components/ui/loading';

const COLORS = ['#3B82F6', '#93C5FD', '#DBEAFE', '#EFF6FF'];

const CompanyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    statsCards: [
      { title: 'Active Jobs', value: '0', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', change: '+0 this month', trend: 'up' },
      { title: 'Total Team Members', value: '0', icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100', change: '+0 this week', trend: 'up' },
      { title: 'Pending Invites', value: '0', icon: UserPlus, color: 'text-amber-600', bgColor: 'bg-amber-100', change: '0 sent today', trend: 'neutral' },
      { title: 'Avg. Interview Score', value: '0%', icon: Star, color: 'text-purple-600', bgColor: 'bg-purple-100', change: 'Not available', trend: 'neutral' },
    ],
    jobData: [
      { name: 'Active', value: 0 },
      { name: 'Closed', value: 0 },
      { name: 'Draft', value: 0 },
    ],
    interviewsData: [
      { name: 'Completed', value: 0 },
      { name: 'Scheduled', value: 0 },
      { name: 'Pending', value: 0 },
      { name: 'Expired', value: 0 },
    ],
    teamData: [
      { name: 'Active', value: 0 },
      { name: 'Invited', value: 0 }
    ],
    candidatesByJobData: [],
    recentActivities: [],
    teamMembers: []
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const CACHE_KEY = 'company_dashboard_cache_v1';
  const CACHE_TTL_MS = 30 * 1000; // 30s, align with backend TTL
  
  useEffect(() => {
    const controller = new AbortController();
    const fetchDashboardData = async (hasWarmCache: boolean) => {
      if (!hasWarmCache) setLoading(true);
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your dashboard.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // Prefer single aggregated endpoint; fallback exists but avoided unless needed
        const dashboardResponse = await fetch(`${import.meta.env.VITE_API_URL}/company/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        // Handle authentication errors
        if (!dashboardResponse.ok && dashboardResponse.status === 401) {
          localStorage.removeItem('token');
          toast({
            title: "Session Expired",
            description: "Your login session has expired. Please log in again.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // Process dashboard data
        let incomingData = null;
        if (dashboardResponse.ok) {
          const result = await dashboardResponse.json();
          if (result.success) incomingData = result.data;
        }

        // Process the dashboard data
        if (incomingData) {
          // Map string icon names to actual components
          const iconMap = {
            FileText: FileText,
            Calendar: Calendar,
            UserPlus: UserPlus,
            Clock: Clock,
            Users: Users,
            Star: Star
          };
          
          // Update the icons in the statsCards array
          if (incomingData.statsCards) {
            incomingData.statsCards = incomingData.statsCards.map(card => ({
              ...card,
              icon: iconMap[card.icon] || FileText // Fallback to FileText if icon not found
            }));
          }
          
          // Sort activities by time before setting data (optimized)
          if (incomingData.recentActivities && incomingData.recentActivities.length > 0) {
            incomingData.recentActivities = sortActivitiesOptimized(incomingData.recentActivities);
          }
          
          setDashboardData(incomingData);
          // Save to cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: {
                ...incomingData,
                statsCards: incomingData.statsCards?.map(card => ({ ...card, icon: (card.icon && typeof card.icon === 'function') ? 'FileText' : card.icon }))
              }
            }));
          } catch (_) {}
        } else {
          setError('Failed to fetch dashboard data');
          toast({
            title: "Error",
            description: "Failed to fetch dashboard data",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
    
    let servedFromCache = false;
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && cached.timestamp && (Date.now() - cached.timestamp) < CACHE_TTL_MS && cached.data) {
          const iconMap = { FileText, Calendar, UserPlus, Clock, Users, Star };
          const cachedData = {
            ...cached.data,
            statsCards: (cached.data.statsCards || []).map((card: any) => ({
              ...card,
              icon: iconMap[card.icon] || FileText
            }))
          };
          setDashboardData(cachedData);
          setLoading(false);
          servedFromCache = true;
        }
      }
    } catch (_) {}

    // Always revalidate in background
    fetchDashboardData(servedFromCache);

    return () => controller.abort();
  }, [toast, navigate]);

  // Helper function to construct dashboard data from individual APIs
  const constructDashboardFromIndividualAPIs = async (jobsResponse, candidatesResponse, token) => {
    try {
      let jobs = [];
      let candidates = [];

      // Process jobs data
      if (jobsResponse.status === 'fulfilled' && jobsResponse.value.ok) {
        const jobsData = await jobsResponse.value.json();
        if (jobsData.success) {
          jobs = jobsData.data || [];
        }
      }

      // Process candidates data
      if (candidatesResponse.status === 'fulfilled' && candidatesResponse.value.ok) {
        const candidatesData = await candidatesResponse.value.json();
        if (candidatesData.success) {
          candidates = candidatesData.candidates || [];
        }
      }

      // Calculate stats from individual data
      const activeJobs = jobs.filter(job => job.status === 'active').length;
      const totalCandidates = candidates.length;
      const completedInterviews = candidates.filter(c => c.status === 'Completed').length;
      const avgScore = candidates.filter(c => c.score !== null).length > 0 
        ? Math.round(candidates.filter(c => c.score !== null).reduce((sum, c) => sum + c.score, 0) / candidates.filter(c => c.score !== null).length)
        : 0;

      return {
        statsCards: [
          { title: 'Active Jobs', value: activeJobs.toString(), icon: 'FileText', color: 'text-blue-600', bgColor: 'bg-blue-100', change: `+${Math.min(activeJobs, 2)} this month`, trend: 'up' },
          { title: 'Total Interviews', value: totalCandidates.toString(), icon: 'Calendar', color: 'text-green-600', bgColor: 'bg-green-100', change: `+${Math.min(totalCandidates, 8)} this week`, trend: 'up' },
          { title: 'Pending Invites', value: '0', icon: 'UserPlus', color: 'text-amber-600', bgColor: 'bg-amber-100', change: '0 sent today', trend: 'neutral' },
          { title: 'Avg. Interview Score', value: `${avgScore}%`, icon: 'Star', color: 'text-purple-600', bgColor: 'bg-purple-100', change: `${avgScore > 75 ? 'Above average' : 'Below average'}`, trend: avgScore > 75 ? 'up' : 'down' },
        ],
        jobData: [
          { name: 'Active', value: activeJobs },
          { name: 'Closed', value: jobs.filter(job => job.status === 'closed').length },
          { name: 'Draft', value: jobs.filter(job => job.status === 'draft').length },
        ],
        interviewsData: [
          { name: 'Completed', value: completedInterviews },
          { name: 'Scheduled', value: candidates.filter(c => c.status === 'Scheduled').length },
          { name: 'Pending', value: candidates.filter(c => c.status === 'Pending').length },
          { name: 'Expired', value: candidates.filter(c => c.status === 'Expired').length },
        ],
        teamData: [
          { name: 'Active', value: 0 },
          { name: 'Invited', value: 0 }
        ],
        candidatesByJobData: [],
        recentActivities: [],
        teamMembers: []
      };
    } catch (error) {
      console.error('Error constructing dashboard data:', error);
      return null;
    }
  };

  // Optimized activity sorting function
  const sortActivitiesOptimized = (activities) => {
    const now = Date.now();
    const timeValues = {
      'Just now': now,
      'Yesterday': now - (24 * 60 * 60 * 1000)
    };

    return activities.sort((a, b) => {
      const getTimeValue = (timeStr) => {
        if (timeValues[timeStr]) return timeValues[timeStr];
        
        const minutesMatch = timeStr.match(/(\d+) minutes ago/);
        if (minutesMatch) return now - (parseInt(minutesMatch[1]) * 60 * 1000);
        
        const hoursMatch = timeStr.match(/(\d+) hour/);
        if (hoursMatch) return now - (parseInt(hoursMatch[1]) * 60 * 60 * 1000);
        
        const daysMatch = timeStr.match(/(\d+) days ago/);
        if (daysMatch) return now - (parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000);
        
        return new Date(timeStr).getTime() || now;
      };

      return getTimeValue(b.time) - getTimeValue(a.time);
    });
  };
  
  // Activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'interview_completed':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'candidate_invited':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'job_posted':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'team_invited':
        return <Users className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Loading state
  if (loading) {
    return <Loading message="Loading dashboard data..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Link to="/company/jobs/create">
            <Button size="sm">Post New Job</Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.statsCards.map((card, index) => (
          <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-full`}>
                {card.icon && <card.icon className="h-4 w-4" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.change}
                {card.trend === 'up' && ' ↑'}
                {card.trend === 'down' && ' ↓'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Job Status Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
            <CardDescription>Distribution of your job postings</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 bg w-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.jobData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[0]}>
                    {dashboardData.jobData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/company/jobs">
              <Button variant="ghost" size="sm">
                View All Jobs
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Interview Status Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
            <CardDescription>Overview of your Team members</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 w-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.teamData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[0]}>
                    {dashboardData.teamData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/company/team">
              <Button variant="ghost" size="sm">
                View All Team Members
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Candidates by Job Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Candidates by Job</CardTitle>
            <CardDescription>Distribution of candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[248px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.candidatesByJobData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" scale="band" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="candidates" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your hiring process</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
              // Take only the 5 most recent activities
              dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {activity.type === 'interview_completed' && (
                          <>
                            <span className="font-semibold text-gray-900">{activity.candidate}</span> completed the interview for{' '}
                            <span className="font-medium text-primary-600">{activity.job}</span>
                          </>
                        )}
                        {activity.type === 'candidate_invited' && (
                          <>
                            <span className="font-semibold text-gray-900">{activity.candidate}</span> was invited to interview for{' '}
                            <span className="font-medium text-primary-600">{activity.job}</span>
                          </>
                        )}
                        {activity.type === 'job_posted' && (
                          <>
                            New job posted: <span className="font-medium text-primary-600">{activity.job}</span>
                          </>
                        )}
                        {activity.type === 'team_invited' && (
                          <>
                            <span className="font-semibold text-gray-900">{activity.member}</span> was invited to join as{' '}
                            <span className="font-medium text-primary-600">{activity.role || 'team member'}</span>
                          </>
                        )}
                      </p>
                      {activity.score && (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          activity.score > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Score: {activity.score}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No recent activities to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People with access to your Student dashboard</CardDescription>
            </div>
            <Link to="/company/team">
              <Button size="sm">
                <Users className="mr-1 h-4 w-4" />
                Manage Team
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.teamMembers && dashboardData.teamMembers.length > 0 ? (
                dashboardData.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {/* Use first letter of name as avatar placeholder */}
                      <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.role || member.email}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-gray-500">
                  <p>No team members yet</p>
                  <Link to="/company/team" className="text-primary hover:underline mt-2 inline-block">
                    Invite team members
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Chart */}
      {dashboardData.teamData && dashboardData.teamData.length > 0 && dashboardData.teamData.some(item => item.value > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
            <CardDescription>Distribution of your team members</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-60 w-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.teamData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[0]}>
                    {dashboardData.teamData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/company/team">
              <Button variant="ghost" size="sm">
                Manage Team
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CompanyDashboard;