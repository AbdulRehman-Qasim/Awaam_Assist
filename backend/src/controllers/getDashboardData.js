const mongoose = require('mongoose');
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const TeamMember = require("../models/TeamMember");

// Simple in-memory cache for dashboard responses per company
// Structure: { [companyId]: { data, expiresAt } }
const dashboardCache = new Map();
// Default TTL: 30 seconds (tune as needed)
const DASHBOARD_CACHE_TTL_MS = 30 * 1000;

/**
 * Get dashboard data for company
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Object} 
 */
const getDashboardData = async (req, res) => {
  try {
    if (!req.companyId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - you must be logged in to access dashboard' 
      });
    }

    const companyId = req.companyId;
    // Serve from cache if fresh
    const cached = dashboardCache.get(companyId);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json({ success: true, data: cached.data });
    }
    
    const [
      jobsData,
      recentJobs,
      candidatesPerJob,
      interviewData,
      teamData,
      inviteStats,
      teamMembers
    ] = await Promise.allSettled([
     
      Job.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        { $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      Job.find({ company: companyId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title department location type status createdAt')
        .lean(),
      
      Candidate.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        { $group: {
            _id: "$jobApplied",
            candidates: { $sum: 1 }
          }
        },
        { $lookup: {
            from: 'jobs',
            localField: '_id',
            foreignField: '_id',
            as: 'jobDetails'
          }
        },
        { $unwind: '$jobDetails' },
        { $project: {
            _id: 1,
            name: '$jobDetails.title',
            candidates: 1
          }
        },
        { $sort: { candidates: -1 } },
        { $limit: 3 } 
      ]),
      
      Candidate.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        { $group: {
            _id: { $toLower: "$status" },
            count: { $sum: 1 }
          }
        }
      ]),
      
      TeamMember.find({ company: companyId })
        .select('name email role status invitedOn lastActive')
        .sort({ invitedOn: -1 })
        .limit(4)
        .lean(), 
      
      TeamMember.aggregate([
        { $match: { 
            company: new mongoose.Types.ObjectId(companyId),
            status: 'invited'
          } 
        },
        { $group: {
            _id: null,
            total: { $sum: 1 },
            todayInvites: {
              $sum: {
                $cond: [
                  { $gte: ["$invitedOn", new Date(new Date().setHours(0, 0, 0, 0))] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      
      TeamMember.find({ company: companyId })
        .select('name email role status')
        .sort({ status: 1, name: 1 })
        .limit(6)
        .lean()
    ]);
    
    // Process results safely
    const jobsDataResult = jobsData.status === 'fulfilled' ? jobsData.value : [];
    const recentJobsResult = recentJobs.status === 'fulfilled' ? recentJobs.value : [];
    const candidatesPerJobResult = candidatesPerJob.status === 'fulfilled' ? candidatesPerJob.value : [];
    const interviewDataResult = interviewData.status === 'fulfilled' ? interviewData.value : [];
    const teamDataResult = teamData.status === 'fulfilled' ? teamData.value : [];
    const inviteStatsResult = inviteStats.status === 'fulfilled' ? inviteStats.value : [];
    const teamMembersResult = teamMembers.status === 'fulfilled' ? teamMembers.value : [];
    
    const jobStats = {
      active: 0,
      closed: 0,
      draft: 0
    };
    
    jobsDataResult.forEach(item => {
      jobStats[item._id.toLowerCase()] = item.count;
    });
    
    const interviewStats = {
      completed: 0,
      scheduled: 0,
      pending: 0,
      expired: 0
    };
    
    interviewDataResult.forEach(item => {
      interviewStats[item._id] = item.count;
    });
    
    const pendingInvites = inviteStatsResult.length > 0 ? inviteStatsResult[0].total : 0;
    const invitesToday = inviteStatsResult.length > 0 ? inviteStatsResult[0].todayInvites : 0;
    
    // Calculate total numbers for stats cards
    const totalActiveJobs = jobStats.active || 0;
    const totalInterviews = Object.values(interviewStats).reduce((sum, count) => sum + count, 0);
    
    // Calculate average interview score (simplified query)
    const avgScoreResult = await Candidate.aggregate([
      { $match: { 
          company: new mongoose.Types.ObjectId(companyId), 
          score: { $ne: null } 
        } 
      },
      { $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;
    
    const activities = [];
    
    recentJobsResult.forEach(job => {
      activities.push({
        id: `job-${job._id}`,
        type: 'job_posted',
        job: job.title,
        time: getRelativeTimeString(job.createdAt)
      });
    });
    
    teamMembersResult.filter(member => member.status === 'invited').slice(0, 2).forEach(invite => {
      activities.push({
        id: `invite-${invite._id}`,
        type: 'team_invited',
        member: invite.name,
        role: invite.role,
        time: getRelativeTimeString(invite.invitedOn || new Date())
      });
    });
    
    
    const limitedActivities = activities
      .sort((a, b) => {
        const timeA = getTimeFromRelativeString(a.time);
        const timeB = getTimeFromRelativeString(b.time);
        return timeB - timeA;
      })
      .slice(0, 5);
    
    const responseData = {
      statsCards: [
        { title: 'Active Jobs', value: totalActiveJobs.toString(), icon: 'FileText', color: 'text-blue-600', bgColor: 'bg-blue-100', change: `+${Math.min(totalActiveJobs, 2)} this month`, trend: 'up' },
        { title: 'Total Interviews', value: totalInterviews.toString(), icon: 'Calendar', color: 'text-green-600', bgColor: 'bg-green-100', change: `+${Math.min(totalInterviews, 8)} this week`, trend: 'up' },
        { title: 'Pending Invites', value: pendingInvites.toString(), icon: 'UserPlus', color: 'text-amber-600', bgColor: 'bg-amber-100', change: `${invitesToday} sent today`, trend: 'neutral' },
        { title: 'Avg. Interview Score', value: `${avgScore}%`, icon: 'Star', color: 'text-purple-600', bgColor: 'bg-purple-100', change: `${avgScore > 75 ? 'Above average' : 'Below average'}`, trend: avgScore > 75 ? 'up' : 'down' },
      ],
      jobData: [
        { name: 'Active', value: jobStats.active || 0 },
        { name: 'Closed', value: jobStats.closed || 0 },
        { name: 'Draft', value: jobStats.draft || 0 },
      ],
      interviewsData: [
        { name: 'Completed', value: interviewStats.completed || 0 },
        { name: 'Scheduled', value: interviewStats.scheduled || 0 },
        { name: 'Pending', value: interviewStats.pending || 0 },
        { name: 'Expired', value: interviewStats.expired || 0 },
      ],
      teamData: [
        { name: 'Active', value: teamMembersResult.filter(member => member.status === 'active').length },
        { name: 'Invited', value: pendingInvites }
      ],
      candidatesByJobData: candidatesPerJobResult.map(item => ({
        name: item.name,
        candidates: item.candidates
      })),
      recentActivities: limitedActivities,
      teamMembers: teamMembersResult
    };

    // Save to cache
    dashboardCache.set(companyId, { data: responseData, expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS });

    return res.status(200).json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// Helper function to convert dates to relative time strings
function getRelativeTimeString(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

// Helper function to convert relative time strings back to approximate timestamps for sorting
function getTimeFromRelativeString(relativeTime) {
  const now = new Date().getTime();
  
  if (relativeTime.includes('Just now')) {
    return now;
  } else if (relativeTime.includes('minutes ago')) {
    const minutes = parseInt(relativeTime.split(' ')[0]);
    return now - (minutes * 60 * 1000);
  } else if (relativeTime.includes('hour')) {
    const hours = parseInt(relativeTime.split(' ')[0]);
    return now - (hours * 60 * 60 * 1000);
  } else if (relativeTime === 'Yesterday') {
    return now - (24 * 60 * 60 * 1000);
  } else if (relativeTime.includes('days ago')) {
    const days = parseInt(relativeTime.split(' ')[0]);
    return now - (days * 24 * 60 * 60 * 1000);
  } else {
    // Handle actual dates
    return new Date(relativeTime).getTime();
  }
}

module.exports = {
  getDashboardData
};