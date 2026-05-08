export type SuperAdminStatus = "Approved" | "Pending" | "Suspended";

export type DashboardMetric = {
    title: string;
    value: string;
    note: string;
    tone: string;
};

export type AdminRow = {
    name: string;
    email: string;
    role: string;
    status: SuperAdminStatus;
    lastActive: string;
};

export type ApprovalEntry = {
    name: string;
    location: string;
    submittedBy: string;
    submittedAt: string;
    note: string;
};

export type OverviewRow = {
    name: string;
    location: string;
    owner: string;
    status: string;
};

export type ChartPoint = {
    label: string;
    value: number;
};

export const dashboardMetrics: DashboardMetric[] = [
    {
        title: "Total Admins",
        value: "28",
        note: "Across education, scheme, and hospital modules",
        tone: "bg-primary-50 text-primary-600",
    },
    {
        title: "Total Universities",
        value: "142",
        note: "Verified records in the education module",
        tone: "bg-blue-50 text-blue-600",
    },
    {
        title: "Total Schemes",
        value: "64",
        note: "Active and archived scheme records",
        tone: "bg-violet-50 text-violet-600",
    },
    {
        title: "Total Hospitals",
        value: "87",
        note: "Hospitals managed across regions",
        tone: "bg-emerald-50 text-emerald-600",
    },
    {
        title: "Pending Requests",
        value: "19",
        note: "Awaiting approval from the super admin team",
        tone: "bg-amber-50 text-amber-600",
    },
];

export const adminRows: AdminRow[] = [
    {
        name: "Ayesha Khan",
        email: "ayesha@awamassist.com",
        role: "Education Admin",
        status: "Approved",
        lastActive: "2 min ago",
    },
    {
        name: "Bilal Ahmed",
        email: "bilal@awamassist.com",
        role: "Scheme Admin",
        status: "Pending",
        lastActive: "15 min ago",
    },
    {
        name: "Dr. Sana Riaz",
        email: "sana@awamassist.com",
        role: "Hospital Admin",
        status: "Approved",
        lastActive: "1 hour ago",
    },
    {
        name: "Hassan Malik",
        email: "hassan@awamassist.com",
        role: "Education Admin",
        status: "Suspended",
        lastActive: "Yesterday",
    },
    {
        name: "Maria Yusuf",
        email: "maria@awamassist.com",
        role: "Scheme Admin",
        status: "Approved",
        lastActive: "Today",
    },
];

export const approvalQueues: Record<"universities" | "schemes" | "hospitals", ApprovalEntry[]> = {
    universities: [
        {
            name: "Iqra Institute of Technology",
            location: "Karachi, Sindh",
            submittedBy: "Education Admin",
            submittedAt: "10 min ago",
            note: "New university onboarding request",
        },
        {
            name: "National University of Commerce",
            location: "Lahore, Punjab",
            submittedBy: "Education Admin",
            submittedAt: "32 min ago",
            note: "Profile verification pending",
        },
    ],
    schemes: [
        {
            name: "Youth Skills Program",
            location: "Federal",
            submittedBy: "Scheme Admin",
            submittedAt: "18 min ago",
            note: "Awaiting policy review",
        },
        {
            name: "Women Enterprise Grant",
            location: "Punjab",
            submittedBy: "Scheme Admin",
            submittedAt: "1 hour ago",
            note: "Needs approval for public listing",
        },
    ],
    hospitals: [
        {
            name: "City Care Hospital",
            location: "Rawalpindi, Punjab",
            submittedBy: "Hospital Admin",
            submittedAt: "7 min ago",
            note: "New hospital record pending",
        },
        {
            name: "Metro Medical Center",
            location: "Peshawar, KP",
            submittedBy: "Hospital Admin",
            submittedAt: "45 min ago",
            note: "Location details require review",
        },
    ],
};

export const overviewUniversities: OverviewRow[] = [
    {
        name: "Iqra University",
        location: "Karachi",
        owner: "Education Admin",
        status: "Verified",
    },
    {
        name: "Superior University",
        location: "Lahore",
        owner: "Education Admin",
        status: "Verified",
    },
    {
        name: "NUST",
        location: "Islamabad",
        owner: "Education Admin",
        status: "Verified",
    },
];

export const overviewSchemes: OverviewRow[] = [
    {
        name: "Benazir Income Support",
        location: "Federal",
        owner: "Scheme Admin",
        status: "Active",
    },
    {
        name: "Youth Loan Scheme",
        location: "Punjab",
        owner: "Scheme Admin",
        status: "Active",
    },
    {
        name: "Skills Development Grant",
        location: "Sindh",
        owner: "Scheme Admin",
        status: "Archived",
    },
];

export const overviewHospitals: OverviewRow[] = [
    {
        name: "Shifa International",
        location: "Islamabad",
        owner: "Hospital Admin",
        status: "Verified",
    },
    {
        name: "Aga Khan Hospital",
        location: "Karachi",
        owner: "Hospital Admin",
        status: "Verified",
    },
    {
        name: "Mayo Hospital",
        location: "Lahore",
        owner: "Hospital Admin",
        status: "Verified",
    },
];

export const chartSeries: ChartPoint[] = [
    { label: "Jan", value: 42 },
    { label: "Feb", value: 58 },
    { label: "Mar", value: 64 },
    { label: "Apr", value: 72 },
    { label: "May", value: 84 },
    { label: "Jun", value: 96 },
];

export const usageStats = [
    { label: "Education traffic", value: "46%", detail: "Highest activity across modules" },
    { label: "Scheme moderation", value: "31%", detail: "Pending workflow review load" },
    { label: "Hospital updates", value: "23%", detail: "Mostly profile maintenance" },
];

export const settingsOptions = [
    { label: "Enable approval notifications", description: "Notify module admins when requests are reviewed." },
    { label: "Auto-archive inactive admins", description: "Mark inactive accounts for review after 60 days." },
    { label: "Restrict public edits", description: "Keep master data locked unless a super admin approves." },
];