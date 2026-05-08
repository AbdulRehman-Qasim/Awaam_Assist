// Additional 30 Government Schemes to add to existing database
// Run this after running the main seedSchemes.js

require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/SchemeSchema');

const additionalSchemes = [
    // WATER & SANITATION (3 schemes)
    {
        schemeId: "PKS026",
        schemeName: "Clean Drinking Water for All",
        shortName: "Clean Water",
        category: "Water & Sanitation",
        subCategory: "Water Supply",
        department: "Ministry of Water Resources",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Water Filtration Plant", "Water Quality Testing", "Maintenance Support"],
            duration: "Permanent installation"
        },
        eligibility: {
            income: { min: 0, max: 40000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Rural Community"],
            employmentStatus: ["Any"]
        },
        application: {
            method: "Through Union Council",
            website: "https://mowr.gov.pk",
            steps: ["Submit application to UC", "Community verification", "Site survey", "Installation"],
            requiredDocuments: ["CNIC", "Community Letter", "UC Verification"],
            processingTime: "60-90 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9252404"],
            email: ["info@mowr.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of Water Resources, Islamabad", phone: "051-9252404" }],
            website: "https://mowr.gov.pk"
        },
        launchDate: new Date("2019-03-22"),
        status: "Active",
        description: "Free water filtration plants for rural communities lacking clean drinking water",
        longDescription: "This scheme provides water filtration plants to communities without access to clean drinking water, improving public health.",
        stats: { beneficiaries: 2000000, budgetAllocated: 10000000000, applicationsReceived: 5000 }
    },

    {
        schemeId: "PKS027",
        schemeName: "Sindh Rural Sanitation Program",
        shortName: "Rural Sanitation",
        category: "Water & Sanitation",
        subCategory: "Sanitation",
        department: "Sindh Local Government Department",
        province: "Sindh",
        cities: [],
        benefits: {
            financial: { amount: 25000, frequency: "One-time Grant", currency: "PKR" },
            nonFinancial: ["Toilet Construction Materials", "Technical Guidance"],
            duration: "One-time"
        },
        eligibility: {
            income: { min: 0, max: 35000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Rural Resident"],
            employmentStatus: ["Any"],
            specialConditions: ["Must not have toilet facility"]
        },
        application: {
            method: "Through District Office",
            website: "https://sindhlgd.gov.pk",
            steps: ["Apply at district office", "Verification", "Receive grant", "Construct toilet"],
            requiredDocuments: ["CNIC", "House Ownership Proof", "Income Certificate"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["021-99211234"],
            email: ["sanitation@sindh.gov.pk"],
            offices: [{ city: "Karachi", address: "Sindh LG Department, Karachi", phone: "021-99211234" }],
            website: "https://sindhlgd.gov.pk"
        },
        launchDate: new Date("2020-06-01"),
        status: "Active",
        description: "Financial assistance for constructing toilets in rural households",
        longDescription: "Provides grants to rural families for building proper sanitation facilities to improve hygiene.",
        stats: { beneficiaries: 100000, budgetAllocated: 2500000000, applicationsReceived: 150000 }
    },

    {
        schemeId: "PKS028",
        schemeName: "Punjab Clean Water Initiative",
        shortName: "Punjab Water",
        category: "Water & Sanitation",
        subCategory: "Water Treatment",
        department: "Punjab Public Health Engineering Department",
        province: "Punjab",
        cities: ["Lahore", "Faisalabad", "Multan", "Rawalpindi"],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Water Treatment Facility", "Regular Monitoring", "Quality Assurance"],
            duration: "Ongoing"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 0, max: 100 },
            categories: ["Any"],
            employmentStatus: ["Any"]
        },
        application: {
            method: "Automatic for covered areas",
            website: "https://phed.punjab.gov.pk",
            steps: ["Check coverage area", "Register complaint if water quality poor", "Get testing done"],
            requiredDocuments: ["CNIC", "Address Proof"],
            processingTime: "Immediate",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203456"],
            email: ["water@punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "PHED Office, Lahore", phone: "042-99203456" }],
            website: "https://phed.punjab.gov.pk"
        },
        launchDate: new Date("2018-01-01"),
        status: "Active",
        description: "Clean and safe drinking water supply to urban and peri-urban areas",
        longDescription: "Ensures provision of clean drinking water through treatment plants and regular quality monitoring.",
        stats: { beneficiaries: 5000000, budgetAllocated: 25000000000, applicationsReceived: 0 }
    },

    // WOMEN EMPOWERMENT (4 schemes)
    {
        schemeId: "PKS029",
        schemeName: "Women Entrepreneurship Program",
        shortName: "Women Business",
        category: "Women Empowerment",
        subCategory: "Business Development",
        department: "SMEDA - Small and Medium Enterprises Development Authority",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 300000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Training", "Marketing Support", "Networking Events"],
            duration: "24-month repayment"
        },
        eligibility: {
            income: { min: 0, max: 70000 },
            age: { min: 21, max: 50 },
            categories: ["Woman", "Entrepreneur"],
            employmentStatus: ["Self-Employed", "Unemployed"],
            gender: "Female"
        },
        application: {
            method: "Online & Through SMEDA Offices",
            website: "https://smeda.org",
            steps: ["Register online", "Submit business plan", "Attend training", "Get loan approval"],
            requiredDocuments: ["CNIC", "Business Plan", "Educational Certificates"],
            processingTime: "45 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-111-111-456"],
            email: ["women@smeda.org"],
            offices: [{ city: "Islamabad", address: "SMEDA Headquarters, Islamabad", phone: "051-111-111-456" }],
            website: "https://smeda.org"
        },
        launchDate: new Date("2017-03-08"),
        status: "Active",
        description: "Low-interest loans and business support for women entrepreneurs",
        longDescription: "Empowers women to start and grow their businesses with financial and technical support.",
        stats: { beneficiaries: 50000, budgetAllocated: 15000000000, applicationsReceived: 100000 }
    },

    {
        schemeId: "PKS030",
        schemeName: "Ehsaas Women Empowerment Centers",
        shortName: "Women Centers",
        category: "Women Empowerment",
        subCategory: "Skills Training",
        department: "Ehsaas Program",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 15000, frequency: "Monthly Stipend", currency: "PKR" },
            nonFinancial: ["Vocational Training", "Certification", "Job Placement"],
            duration: "6 months"
        },
        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 18, max: 45 },
            categories: ["Woman"],
            employmentStatus: ["Unemployed"],
            gender: "Female"
        },
        application: {
            method: "Through Ehsaas Centers",
            website: "https://ehsaas.gov.pk",
            steps: ["Visit nearest center", "Select training course", "Enroll", "Complete training"],
            requiredDocuments: ["CNIC", "Educational Certificates"],
            processingTime: "7 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245100"],
            email: ["women@ehsaas.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ehsaas Program Office", phone: "051-9245100" }],
            website: "https://ehsaas.gov.pk"
        },
        launchDate: new Date("2021-01-01"),
        status: "Active",
        description: "Skills training and employment support for women",
        longDescription: "Provides vocational training to women in various trades with job placement assistance.",
        stats: { beneficiaries: 75000, budgetAllocated: 6750000000, applicationsReceived: 150000 }
    },

    {
        schemeId: "PKS031",
        schemeName: "Punjab Women Protection Authority Support",
        shortName: "Women Protection",
        category: "Women Empowerment",
        subCategory: "Legal Support",
        department: "Punjab Women Protection Authority",
        province: "Punjab",
        cities: ["Lahore", "Faisalabad", "Multan", "Rawalpindi"],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Legal Aid", "Shelter", "Counseling", "Medical Support"],
            duration: "As needed"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 18, max: 100 },
            categories: ["Woman", "Victim of Violence"],
            employmentStatus: ["Any"],
            gender: "Female"
        },
        application: {
            method: "Walk-in or Helpline",
            website: "https://pwpa.punjab.gov.pk",
            steps: ["Call helpline or visit center", "Register complaint", "Get assistance"],
            requiredDocuments: ["CNIC"],
            processingTime: "Immediate",
            isOpen: true
        },
        contact: {
            helpline: ["1043"],
            email: ["info@pwpa.punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "PWPA Office, Lahore", phone: "042-99203789" }],
            website: "https://pwpa.punjab.gov.pk"
        },
        launchDate: new Date("2016-05-01"),
        status: "Active",
        description: "Legal aid and protection services for women facing violence",
        longDescription: "Provides comprehensive support including legal aid, shelter, and counseling to women victims of violence.",
        stats: { beneficiaries: 25000, budgetAllocated: 500000000, applicationsReceived: 30000 }
    },

    {
        schemeId: "PKS032",
        schemeName: "Sindh Women Development Program",
        shortName: "Sindh Women",
        category: "Women Empowerment",
        subCategory: "Economic Empowerment",
        department: "Sindh Women Development Department",
        province: "Sindh",
        cities: [],
        benefits: {
            financial: { amount: 100000, frequency: "One-time Grant", currency: "PKR" },
            nonFinancial: ["Business Equipment", "Training", "Mentorship"],
            duration: "One-time"
        },
        eligibility: {
            income: { min: 0, max: 40000 },
            age: { min: 21, max: 55 },
            categories: ["Woman"],
            employmentStatus: ["Self-Employed", "Unemployed"],
            gender: "Female"
        },
        application: {
            method: "Through District Offices",
            website: "https://sindh.gov.pk/women",
            steps: ["Apply at district office", "Submit business proposal", "Get approval", "Receive grant"],
            requiredDocuments: ["CNIC", "Business Proposal", "Income Certificate"],
            processingTime: "30-45 days",
            isOpen: true
        },
        contact: {
            helpline: ["021-99211567"],
            email: ["women@sindh.gov.pk"],
            offices: [{ city: "Karachi", address: "Women Development Department, Karachi", phone: "021-99211567" }],
            website: "https://sindh.gov.pk"
        },
        launchDate: new Date("2019-08-14"),
        status: "Active",
        description: "Financial grants for women to start small businesses",
        longDescription: "Supports women in starting income-generating activities through grants and training.",
        stats: { beneficiaries: 30000, budgetAllocated: 3000000000, applicationsReceived: 60000 }
    },

    // DISABLED PERSONS (3 schemes)
    {
        schemeId: "PKS033",
        schemeName: "Special Persons Employment Scheme",
        shortName: "Disabled Jobs",
        category: "Disabled Persons",
        subCategory: "Employment",
        department: "Ministry of Human Rights",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Job Placement", "Skills Training", "Workplace Accommodation"],
            duration: "Permanent employment"
        },
        eligibility: {
            income: { min: 0, max: 80000 },
            age: { min: 18, max: 50 },
            categories: ["Disabled"],
            employmentStatus: ["Unemployed"],
            specialConditions: ["Must have disability certificate"]
        },
        application: {
            method: "Online & Through Offices",
            website: "https://mohr.gov.pk",
            steps: ["Register online", "Upload disability certificate", "Apply for jobs", "Get placement"],
            requiredDocuments: ["CNIC", "Disability Certificate", "Educational Certificates"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9217606"],
            email: ["disabled@mohr.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of Human Rights, Islamabad", phone: "051-9217606" }],
            website: "https://mohr.gov.pk"
        },
        launchDate: new Date("2018-12-03"),
        status: "Active",
        description: "Employment opportunities and support for persons with disabilities",
        longDescription: "Facilitates employment of disabled persons through job placement and workplace accommodation.",
        stats: { beneficiaries: 15000, budgetAllocated: 1000000000, applicationsReceived: 40000 }
    },

    {
        schemeId: "PKS034",
        schemeName: "Financial Assistance for Disabled Persons",
        shortName: "Disabled Support",
        category: "Disabled Persons",
        subCategory: "Financial Aid",
        department: "Pakistan Bait-ul-Mal",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 6000, frequency: "Quarterly", currency: "PKR" },
            nonFinancial: ["Medical Support", "Assistive Devices"],
            duration: "Ongoing"
        },
        eligibility: {
            income: { min: 0, max: 25000 },
            age: { min: 0, max: 100 },
            categories: ["Disabled"],
            employmentStatus: ["Any"],
            specialConditions: ["Must have disability certificate"]
        },
        application: {
            method: "Through PBM Offices",
            website: "https://pbm.gov.pk",
            steps: ["Visit PBM office", "Submit disability certificate", "Get registered", "Receive payments"],
            requiredDocuments: ["CNIC", "Disability Certificate", "Income Certificate"],
            processingTime: "15 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9223081"],
            email: ["disabled@pbm.gov.pk"],
            offices: [{ city: "Islamabad", address: "Pakistan Bait-ul-Mal, Islamabad", phone: "051-9223081" }],
            website: "https://pbm.gov.pk"
        },
        launchDate: new Date("2010-01-01"),
        status: "Active",
        description: "Quarterly financial assistance for disabled persons",
        longDescription: "Provides regular financial support to disabled persons to meet their basic needs.",
        stats: { beneficiaries: 200000, budgetAllocated: 4800000000, applicationsReceived: 300000 }
    },

    {
        schemeId: "PKS035",
        schemeName: "Punjab Special Education Scholarship",
        shortName: "Special Education",
        category: "Disabled Persons",
        subCategory: "Education",
        department: "Punjab Special Education Department",
        province: "Punjab",
        cities: [],
        benefits: {
            financial: { amount: 30000, frequency: "Annual", currency: "PKR" },
            nonFinancial: ["Free Education", "Special Equipment", "Transportation"],
            duration: "Till completion of education"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 5, max: 25 },
            categories: ["Disabled", "Student"],
            employmentStatus: ["Student"],
            specialConditions: ["Must have disability certificate"]
        },
        application: {
            method: "Through Special Education Schools",
            website: "https://specialeducation.punjab.gov.pk",
            steps: ["Enroll in special education school", "Submit disability certificate", "Apply for scholarship"],
            requiredDocuments: ["CNIC (Parent)", "Disability Certificate", "School Enrollment"],
            processingTime: "20 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203567"],
            email: ["info@specialeducation.punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "Special Education Department, Lahore", phone: "042-99203567" }],
            website: "https://specialeducation.punjab.gov.pk"
        },
        launchDate: new Date("2015-09-01"),
        status: "Active",
        description: "Scholarships and educational support for disabled students",
        longDescription: "Provides financial assistance and special facilities for education of disabled children.",
        stats: { beneficiaries: 10000, budgetAllocated: 300000000, applicationsReceived: 15000 }
    },

    // ELDERLY CARE (2 schemes)
    {
        schemeId: "PKS036",
        schemeName: "Senior Citizens Welfare Program",
        shortName: "Senior Care",
        category: "Elderly Care",
        subCategory: "Social Welfare",
        department: "Ministry of Social Welfare",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 8000, frequency: "Quarterly", currency: "PKR" },
            nonFinancial: ["Free Medical Checkup", "Recreation Activities"],
            duration: "Ongoing"
        },
        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 60, max: 100 },
            categories: ["Elderly"],
            employmentStatus: ["Any"]
        },
        application: {
            method: "Through Social Welfare Offices",
            website: "https://mohr.gov.pk/welfare",
            steps: ["Visit welfare office", "Submit age proof", "Get registered", "Receive payments"],
            requiredDocuments: ["CNIC", "Income Certificate"],
            processingTime: "10 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9217890"],
            email: ["seniors@mohr.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of Social Welfare, Islamabad", phone: "051-9217890" }],
            website: "https://mohr.gov.pk"
        },
        launchDate: new Date("2016-10-01"),
        status: "Active",
        description: "Financial and social support for senior citizens",
        longDescription: "Provides quarterly financial assistance and welfare services to elderly persons.",
        stats: { beneficiaries: 150000, budgetAllocated: 4800000000, applicationsReceived: 200000 }
    },

    {
        schemeId: "PKS037",
        schemeName: "Punjab Senior Citizen Card",
        shortName: "Senior Card",
        category: "Elderly Care",
        subCategory: "Benefits Card",
        department: "Punjab Social Welfare Department",
        province: "Punjab",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Discounts on Transport", "Discounts on Healthcare", "Priority Services"],
            duration: "Lifetime"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 60, max: 100 },
            categories: ["Elderly"],
            employmentStatus: ["Any"]
        },
        application: {
            method: "Through District Offices",
            website: "https://punjab.gov.pk/seniors",
            steps: ["Visit district office", "Submit CNIC", "Get card issued"],
            requiredDocuments: ["CNIC"],
            processingTime: "Same day",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203678"],
            email: ["seniors@punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "Social Welfare Department, Lahore", phone: "042-99203678" }],
            website: "https://punjab.gov.pk"
        },
        launchDate: new Date("2019-01-01"),
        status: "Active",
        description: "Benefits card for senior citizens with discounts and priority services",
        longDescription: "Provides senior citizens with a card offering various discounts and priority access to services.",
        stats: { beneficiaries: 500000, budgetAllocated: 100000000, applicationsReceived: 600000 }
    },

    // ORPHAN SUPPORT (2 schemes)
    {
        schemeId: "PKS038",
        schemeName: "Orphan Care and Support Program",
        shortName: "Orphan Care",
        category: "Orphan Support",
        subCategory: "Child Welfare",
        department: "Pakistan Bait-ul-Mal",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 5000, frequency: "Monthly", currency: "PKR" },
            nonFinancial: ["Free Education", "Free Healthcare", "Counseling"],
            duration: "Till age 18"
        },
        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 0, max: 18 },
            categories: ["Orphan"],
            employmentStatus: ["Student"],
            specialConditions: ["Must have death certificate of parent(s)"]
        },
        application: {
            method: "Through PBM Offices",
            website: "https://pbm.gov.pk",
            steps: ["Visit PBM office", "Submit death certificate", "Get registered", "Receive monthly support"],
            requiredDocuments: ["Birth Certificate", "Death Certificate of Parent(s)", "Guardian CNIC"],
            processingTime: "15 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9223081"],
            email: ["orphan@pbm.gov.pk"],
            offices: [{ city: "Islamabad", address: "Pakistan Bait-ul-Mal, Islamabad", phone: "051-9223081" }],
            website: "https://pbm.gov.pk"
        },
        launchDate: new Date("2005-01-01"),
        status: "Active",
        description: "Monthly financial support and welfare services for orphans",
        longDescription: "Provides comprehensive support to orphaned children including financial assistance, education, and healthcare.",
        stats: { beneficiaries: 100000, budgetAllocated: 6000000000, applicationsReceived: 150000 }
    },

    {
        schemeId: "PKS039",
        schemeName: "Sindh Orphan Education Scheme",
        shortName: "Orphan Education",
        category: "Orphan Support",
        subCategory: "Education",
        department: "Sindh Education Department",
        province: "Sindh",
        cities: [],
        benefits: {
            financial: { amount: 20000, frequency: "Annual", currency: "PKR" },
            nonFinancial: ["Free Books", "Free Uniform", "Free Tuition"],
            duration: "Till completion of education"
        },
        eligibility: {
            income: { min: 0, max: 35000 },
            age: { min: 5, max: 22 },
            categories: ["Orphan", "Student"],
            employmentStatus: ["Student"],
            specialConditions: ["Must be enrolled in school/college"]
        },
        application: {
            method: "Through Schools",
            website: "https://sindheducation.gov.pk",
            steps: ["Enroll in school", "Submit orphan certificate", "Apply for scholarship", "Receive support"],
            requiredDocuments: ["Birth Certificate", "Death Certificate of Parent(s)", "School Enrollment"],
            processingTime: "20 days",
            isOpen: true
        },
        contact: {
            helpline: ["021-99211890"],
            email: ["orphan@sindheducation.gov.pk"],
            offices: [{ city: "Karachi", address: "Sindh Education Department, Karachi", phone: "021-99211890" }],
            website: "https://sindheducation.gov.pk"
        },
        launchDate: new Date("2017-09-01"),
        status: "Active",
        description: "Educational scholarships and support for orphaned children",
        longDescription: "Ensures orphaned children receive quality education through financial assistance and free educational materials.",
        stats: { beneficiaries: 25000, budgetAllocated: 500000000, applicationsReceived: 40000 }
    },

    // ENVIRONMENT (2 schemes)
    {
        schemeId: "PKS040",
        schemeName: "10 Billion Tree Tsunami",
        shortName: "Tree Tsunami",
        category: "Environment",
        subCategory: "Afforestation",
        department: "Ministry of Climate Change",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 15000, frequency: "Monthly Wage", currency: "PKR" },
            nonFinancial: ["Employment", "Training", "Equipment"],
            duration: "Project duration"
        },
        eligibility: {
            income: { min: 0, max: 40000 },
            age: { min: 18, max: 50 },
            categories: ["Unemployed", "Daily Wage Worker"],
            employmentStatus: ["Unemployed", "Daily Wage Worker"]
        },
        application: {
            method: "Through Forest Department",
            website: "https://www.mocc.gov.pk",
            steps: ["Visit forest department office", "Register for plantation work", "Get assigned to site", "Start work"],
            requiredDocuments: ["CNIC"],
            processingTime: "7 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245588"],
            email: ["tsunami@mocc.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of Climate Change, Islamabad", phone: "051-9245588" }],
            website: "https://www.mocc.gov.pk"
        },
        launchDate: new Date("2018-09-01"),
        status: "Active",
        description: "Employment in tree plantation and forest conservation",
        longDescription: "Provides employment to people in tree plantation activities while combating climate change.",
        stats: { beneficiaries: 500000, budgetAllocated: 125000000000, applicationsReceived: 1000000 }
    },

    {
        schemeId: "PKS041",
        schemeName: "KP Billion Tree Honey Initiative",
        shortName: "Honey Initiative",
        category: "Environment",
        subCategory: "Beekeeping",
        department: "KP Forest Department",
        province: "KPK",
        cities: [],
        benefits: {
            financial: { amount: 50000, frequency: "One-time Grant", currency: "PKR" },
            nonFinancial: ["Beekeeping Equipment", "Training", "Marketing Support"],
            duration: "One-time"
        },
        eligibility: {
            income: { min: 0, max: 60000 },
            age: { min: 21, max: 55 },
            categories: ["Farmer", "Entrepreneur"],
            employmentStatus: ["Self-Employed", "Unemployed"]
        },
        application: {
            method: "Through Forest Department",
            website: "https://forest.kp.gov.pk",
            steps: ["Apply at forest office", "Attend training", "Receive equipment", "Start beekeeping"],
            requiredDocuments: ["CNIC", "Land Documents (if applicable)"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["091-9213456"],
            email: ["honey@forest.kp.gov.pk"],
            offices: [{ city: "Peshawar", address: "KP Forest Department, Peshawar", phone: "091-9213456" }],
            website: "https://forest.kp.gov.pk"
        },
        launchDate: new Date("2019-05-01"),
        status: "Active",
        description: "Support for beekeeping to promote environmental conservation and income generation",
        longDescription: "Promotes beekeeping as a sustainable livelihood while supporting forest conservation.",
        stats: { beneficiaries: 10000, budgetAllocated: 500000000, applicationsReceived: 20000 }
    },

    // TECHNOLOGY & INNOVATION (3 schemes)
    {
        schemeId: "PKS042",
        schemeName: "National Incubation Centers",
        shortName: "NIC",
        category: "Technology & Innovation",
        subCategory: "Startup Support",
        department: "Ministry of IT & Telecom",
        province: "Federal",
        cities: ["Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"],
        benefits: {
            financial: { amount: 2000000, frequency: "Seed Funding", currency: "PKR" },
            nonFinancial: ["Office Space", "Mentorship", "Networking", "Technical Support"],
            duration: "12 months incubation"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 21, max: 40 },
            categories: ["Entrepreneur", "Tech Startup"],
            employmentStatus: ["Self-Employed", "Unemployed"],
            educationLevel: ["Bachelor's", "Master's"]
        },
        application: {
            method: "Online",
            website: "https://ignite.org.pk/nic",
            steps: ["Apply online with startup idea", "Submit business plan", "Pitch to panel", "Get selected", "Start incubation"],
            requiredDocuments: ["CNIC", "Business Plan", "Team Details", "Prototype (if available)"],
            processingTime: "60 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-111-100-200"],
            email: ["nic@ignite.org.pk"],
            offices: [{ city: "Islamabad", address: "Ignite - National Technology Fund, Islamabad", phone: "051-111-100-200" }],
            website: "https://ignite.org.pk"
        },
        launchDate: new Date("2017-01-01"),
        status: "Active",
        description: "Incubation and seed funding for tech startups",
        longDescription: "Provides comprehensive support to technology startups including funding, mentorship, and infrastructure.",
        stats: { beneficiaries: 1000, budgetAllocated: 2000000000, applicationsReceived: 5000 }
    },

    {
        schemeId: "PKS043",
        schemeName: "DigiSkills Training Program",
        shortName: "DigiSkills",
        category: "Technology & Innovation",
        subCategory: "Digital Skills",
        department: "Ministry of IT & Telecom",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Online Courses", "Certification", "Freelancing Support"],
            duration: "3-6 months per course"
        },
        eligibility: {
            income: { min: 0, max: 80000 },
            age: { min: 16, max: 45 },
            categories: ["Youth", "Student", "Unemployed"],
            employmentStatus: ["Any"],
            educationLevel: ["Matric", "Intermediate", "Bachelor's", "Master's"]
        },
        application: {
            method: "Online",
            website: "https://digiskills.pk",
            steps: ["Register on DigiSkills portal", "Select course", "Complete online training", "Pass exam", "Get certificate"],
            requiredDocuments: ["CNIC", "Email Address"],
            processingTime: "Immediate",
            isOpen: true
        },
        contact: {
            helpline: ["051-111-100-200"],
            email: ["support@digiskills.pk"],
            offices: [{ city: "Islamabad", address: "Ignite - National Technology Fund, Islamabad", phone: "051-111-100-200" }],
            website: "https://digiskills.pk"
        },
        launchDate: new Date("2018-01-01"),
        status: "Active",
        description: "Free online training in digital skills and freelancing",
        longDescription: "Offers free online courses in various digital skills to enable youth to earn through freelancing.",
        stats: { beneficiaries: 1000000, budgetAllocated: 500000000, applicationsReceived: 2000000 }
    },

    {
        schemeId: "PKS044",
        schemeName: "E-Rozgaar Training Centers",
        shortName: "E-Rozgaar",
        category: "Technology & Innovation",
        subCategory: "Freelancing",
        department: "Punjab IT Board",
        province: "Punjab",
        cities: ["Lahore", "Faisalabad", "Multan", "Rawalpindi", "Gujranwala"],
        benefits: {
            financial: { amount: 10000, frequency: "Monthly Stipend", currency: "PKR" },
            nonFinancial: ["Free Training", "Computer Access", "Internet", "Freelancing Support"],
            duration: "6 months"
        },
        eligibility: {
            income: { min: 0, max: 60000 },
            age: { min: 18, max: 35 },
            categories: ["Youth", "Unemployed"],
            employmentStatus: ["Unemployed", "Student"],
            educationLevel: ["Intermediate", "Bachelor's"]
        },
        application: {
            method: "Online & Walk-in",
            website: "https://erozgaar.pitb.gov.pk",
            steps: ["Apply online", "Pass entry test", "Enroll in training", "Complete course", "Start freelancing"],
            requiredDocuments: ["CNIC", "Educational Certificates", "Domicile"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-111-748-200"],
            email: ["erozgaar@pitb.gov.pk"],
            offices: [{ city: "Lahore", address: "Punjab IT Board, Arfa Tower, Lahore", phone: "042-111-748-200" }],
            website: "https://erozgaar.pitb.gov.pk"
        },
        launchDate: new Date("2013-01-01"),
        status: "Active",
        description: "Free training in freelancing and IT skills with stipend",
        longDescription: "Trains youth in freelancing skills and provides them with facilities to start earning online.",
        stats: { beneficiaries: 50000, budgetAllocated: 3000000000, applicationsReceived: 150000 }
    },

    // TOURISM (2 schemes)
    {
        schemeId: "PKS045",
        schemeName: "Tourism Development Fund",
        shortName: "Tourism Fund",
        category: "Tourism",
        subCategory: "Business Development",
        department: "Pakistan Tourism Development Corporation",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 5000000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Advisory", "Marketing Support", "Training"],
            duration: "5-year repayment"
        },
        eligibility: {
            income: { min: 0, max: 200000 },
            age: { min: 21, max: 60 },
            categories: ["Entrepreneur", "Business Owner"],
            employmentStatus: ["Self-Employed"],
            specialConditions: ["Tourism-related business"]
        },
        application: {
            method: "Through PTDC Offices",
            website: "https://tourism.gov.pk",
            steps: ["Submit business plan", "Get feasibility study done", "Apply for loan", "Get approval", "Receive funds"],
            requiredDocuments: ["CNIC", "Business Plan", "Feasibility Study", "Collateral Documents"],
            processingTime: "60-90 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9252406"],
            email: ["info@tourism.gov.pk"],
            offices: [{ city: "Islamabad", address: "PTDC Headquarters, Islamabad", phone: "051-9252406" }],
            website: "https://tourism.gov.pk"
        },
        launchDate: new Date("2020-01-01"),
        status: "Active",
        description: "Loans for tourism-related businesses and infrastructure",
        longDescription: "Provides financial support to entrepreneurs for establishing tourism businesses.",
        stats: { beneficiaries: 500, budgetAllocated: 2500000000, applicationsReceived: 2000 }
    },

    {
        schemeId: "PKS046",
        schemeName: "KP Tourism and Culture Development",
        shortName: "KP Tourism",
        category: "Tourism",
        subCategory: "Infrastructure",
        department: "KP Tourism Department",
        province: "KPK",
        cities: [],
        benefits: {
            financial: { amount: 1000000, frequency: "One-time Grant", currency: "PKR" },
            nonFinancial: ["Infrastructure Development", "Marketing", "Training"],
            duration: "One-time"
        },
        eligibility: {
            income: { min: 0, max: 150000 },
            age: { min: 21, max: 65 },
            categories: ["Entrepreneur", "Local Community"],
            employmentStatus: ["Self-Employed"],
            specialConditions: ["Tourism business in KP"]
        },
        application: {
            method: "Through Tourism Department",
            website: "https://kptourism.gov.pk",
            steps: ["Submit proposal", "Site inspection", "Approval", "Receive grant"],
            requiredDocuments: ["CNIC", "Business Proposal", "Land Documents"],
            processingTime: "45 days",
            isOpen: true
        },
        contact: {
            helpline: ["091-9213567"],
            email: ["info@kptourism.gov.pk"],
            offices: [{ city: "Peshawar", address: "KP Tourism Department, Peshawar", phone: "091-9213567" }],
            website: "https://kptourism.gov.pk"
        },
        launchDate: new Date("2019-03-01"),
        status: "Active",
        description: "Grants for tourism infrastructure and business development in KP",
        longDescription: "Supports development of tourism infrastructure and businesses in Khyber Pakhtunkhwa.",
        stats: { beneficiaries: 1000, budgetAllocated: 1000000000, applicationsReceived: 3000 }
    },

    // LIVESTOCK (2 schemes)
    {
        schemeId: "PKS047",
        schemeName: "Prime Minister's Livestock Program",
        shortName: "PM Livestock",
        category: "Livestock",
        subCategory: "Animal Husbandry",
        department: "Ministry of National Food Security",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Animals (Goats/Sheep)", "Veterinary Services", "Training"],
            duration: "One-time distribution"
        },
        eligibility: {
            income: { min: 0, max: 35000 },
            age: { min: 18, max: 60 },
            categories: ["Low Income Family", "Farmer"],
            employmentStatus: ["Self-Employed", "Unemployed"]
        },
        application: {
            method: "Through District Livestock Office",
            website: "https://mnfsr.gov.pk",
            steps: ["Apply at district office", "Attend training", "Receive animals", "Start rearing"],
            requiredDocuments: ["CNIC", "Income Certificate", "Land/Space Proof"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9205709"],
            email: ["livestock@mnfsr.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of National Food Security, Islamabad", phone: "051-9205709" }],
            website: "https://mnfsr.gov.pk"
        },
        launchDate: new Date("2021-08-14"),
        status: "Active",
        description: "Free livestock distribution to poor families for income generation",
        longDescription: "Provides free animals to poor families to help them generate income through livestock rearing.",
        stats: { beneficiaries: 50000, budgetAllocated: 5000000000, applicationsReceived: 150000 }
    },

    {
        schemeId: "PKS048",
        schemeName: "Punjab Livestock Development Scheme",
        shortName: "Punjab Livestock",
        category: "Livestock",
        subCategory: "Veterinary Services",
        department: "Punjab Livestock Department",
        province: "Punjab",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Veterinary Services", "Vaccination", "Artificial Insemination", "Training"],
            duration: "Ongoing"
        },
        eligibility: {
            income: { min: 0, max: 80000 },
            age: { min: 18, max: 100 },
            categories: ["Farmer", "Livestock Owner"],
            employmentStatus: ["Any"],
            specialConditions: ["Must own livestock"]
        },
        application: {
            method: "Walk-in at Veterinary Centers",
            website: "https://livestock.punjab.gov.pk",
            steps: ["Visit nearest veterinary center", "Register animals", "Get services"],
            requiredDocuments: ["CNIC"],
            processingTime: "Immediate",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203890"],
            email: ["info@livestock.punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "Punjab Livestock Department, Lahore", phone: "042-99203890" }],
            website: "https://livestock.punjab.gov.pk"
        },
        launchDate: new Date("2015-01-01"),
        status: "Active",
        description: "Free veterinary services and livestock development support",
        longDescription: "Provides comprehensive veterinary services to livestock owners to improve animal health and productivity.",
        stats: { beneficiaries: 1000000, budgetAllocated: 2000000000, applicationsReceived: 0 }
    },

    // FISHERIES (1 scheme)
    {
        schemeId: "PKS049",
        schemeName: "Fisheries Development and Support",
        shortName: "Fisheries",
        category: "Fisheries",
        subCategory: "Aquaculture",
        department: "Ministry of Maritime Affairs",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 200000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Technical Training", "Fish Seeds", "Equipment Support"],
            duration: "3-year repayment"
        },
        eligibility: {
            income: { min: 0, max: 70000 },
            age: { min: 21, max: 55 },
            categories: ["Fisherman", "Farmer"],
            employmentStatus: ["Self-Employed"],
            specialConditions: ["Access to water body"]
        },
        application: {
            method: "Through Fisheries Department",
            website: "https://maritime.gov.pk",
            steps: ["Apply at fisheries office", "Attend training", "Get loan approval", "Start fish farming"],
            requiredDocuments: ["CNIC", "Land/Pond Documents", "Income Certificate"],
            processingTime: "45 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9206286"],
            email: ["fisheries@maritime.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of Maritime Affairs, Islamabad", phone: "051-9206286" }],
            website: "https://maritime.gov.pk"
        },
        launchDate: new Date("2018-06-01"),
        status: "Active",
        description: "Loans and technical support for fish farming and aquaculture",
        longDescription: "Promotes fish farming by providing loans and technical assistance to fishermen and farmers.",
        stats: { beneficiaries: 10000, budgetAllocated: 2000000000, applicationsReceived: 25000 }
    },

    // INDUSTRIAL DEVELOPMENT (2 schemes)
    {
        schemeId: "PKS050",
        schemeName: "Small Industries Development Loan",
        shortName: "SMEDA Loan",
        category: "Industrial Development",
        subCategory: "Manufacturing",
        department: "SMEDA",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 5000000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Advisory", "Technical Support", "Market Linkages"],
            duration: "5-year repayment"
        },
        eligibility: {
            income: { min: 0, max: 250000 },
            age: { min: 21, max: 60 },
            categories: ["Entrepreneur", "Business Owner"],
            employmentStatus: ["Self-Employed"],
            specialConditions: ["Manufacturing business"]
        },
        application: {
            method: "Through SMEDA Offices",
            website: "https://smeda.org",
            steps: ["Submit business plan", "Get feasibility done", "Apply for loan", "Get approval"],
            requiredDocuments: ["CNIC", "Business Plan", "Financial Statements", "Collateral"],
            processingTime: "60 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-111-111-456"],
            email: ["info@smeda.org"],
            offices: [{ city: "Islamabad", address: "SMEDA Headquarters, Islamabad", phone: "051-111-111-456" }],
            website: "https://smeda.org"
        },
        launchDate: new Date("2010-01-01"),
        status: "Active",
        description: "Loans for small and medium manufacturing industries",
        longDescription: "Provides financial and technical support to small manufacturing businesses.",
        stats: { beneficiaries: 5000, budgetAllocated: 25000000000, applicationsReceived: 15000 }
    },

    {
        schemeId: "PKS051",
        schemeName: "Punjab Industrial Estates Development",
        shortName: "Industrial Estates",
        category: "Industrial Development",
        subCategory: "Infrastructure",
        department: "Punjab Small Industries Corporation",
        province: "Punjab",
        cities: ["Lahore", "Faisalabad", "Sialkot", "Gujranwala"],
        benefits: {
            financial: { amount: 0, frequency: "Subsidized Rent", currency: "PKR" },
            nonFinancial: ["Industrial Plot", "Utilities", "Security"],
            duration: "Long-term lease"
        },
        eligibility: {
            income: { min: 0, max: 300000 },
            age: { min: 21, max: 65 },
            categories: ["Entrepreneur", "Business Owner"],
            employmentStatus: ["Self-Employed"],
            specialConditions: ["Manufacturing/Industrial business"]
        },
        application: {
            method: "Through PSIC Offices",
            website: "https://psic.punjab.gov.pk",
            steps: ["Apply for plot", "Submit business plan", "Get allocation", "Start operations"],
            requiredDocuments: ["CNIC", "Business Registration", "Business Plan"],
            processingTime: "90 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203999"],
            email: ["info@psic.punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "PSIC Office, Lahore", phone: "042-99203999" }],
            website: "https://psic.punjab.gov.pk"
        },
        launchDate: new Date("2005-01-01"),
        status: "Active",
        description: "Subsidized industrial plots and infrastructure for small industries",
        longDescription: "Provides affordable industrial space and infrastructure to promote small industries.",
        stats: { beneficiaries: 2000, budgetAllocated: 5000000000, applicationsReceived: 5000 }
    }
];

// Seed function
const seedAdditionalSchemes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
        console.log('✅ MongoDB Connected');

        // Insert additional schemes (don't clear existing ones)
        const result = await Scheme.insertMany(additionalSchemes);
        console.log(`✅ Successfully added ${result.length} additional schemes`);

        // Get total count
        const totalCount = await Scheme.countDocuments();
        console.log(`\n📊 Total schemes in database: ${totalCount}`);

        // Display summary
        console.log('\n📊 New Schemes Added:');
        console.log('═'.repeat(80));

        // Group by category
        const byCategory = {};
        result.forEach(scheme => {
            if (!byCategory[scheme.category]) {
                byCategory[scheme.category] = [];
            }
            byCategory[scheme.category].push(scheme);
        });

        Object.keys(byCategory).forEach(category => {
            console.log(`\n${category} (${byCategory[category].length} schemes):`);
            byCategory[category].forEach(scheme => {
                console.log(`  • ${scheme.schemeName} (${scheme.schemeId})`);
            });
        });

        console.log('\n═'.repeat(80));
        console.log(`\n✅ Added: ${result.length} new schemes`);
        console.log(`✅ Total in database: ${totalCount} schemes`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding additional schemes:', error);
        process.exit(1);
    }
};

// Run seed function
seedAdditionalSchemes();
