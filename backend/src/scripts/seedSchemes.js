require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/SchemeSchema');

// Comprehensive Pakistani Government Schemes Data (25 schemes)
const sampleSchemes = [
    // EXISTING SCHEMES (5)
    {
        schemeId: "PKS001",
        schemeName: "Ehsaas Emergency Cash Program",
        shortName: "Ehsaas Cash",
        category: "Financial Assistance",
        subCategory: "Emergency Relief",
        department: "Ehsaas Program - Government of Pakistan",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 12000, frequency: "One-time", currency: "PKR" },
            nonFinancial: [],
            duration: "One-time payment"
        },
        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Daily Wage Worker", "Unemployed"],
            employmentStatus: ["Unemployed", "Self-Employed", "Daily Wage Worker"]
        },
        application: {
            method: "SMS & Online",
            website: "https://ehsaas.gov.pk",
            steps: ["Send your CNIC to 8171", "Wait for verification SMS", "Collect cash from designated Ehsaas center with CNIC"],
            requiredDocuments: ["CNIC (Original)"],
            processingTime: "3-5 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245100", "8171"],
            email: ["info@ehsaas.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ehsaas Program, PM Office, Constitution Avenue", phone: "051-9245100" }],
            website: "https://ehsaas.gov.pk"
        },
        launchDate: new Date("2020-03-31"),
        status: "Active",
        description: "Emergency cash assistance for low-income families affected by economic hardship",
        longDescription: "The Ehsaas Emergency Cash Program provides immediate financial relief to vulnerable families across Pakistan. This initiative aims to support those facing economic difficulties by providing direct cash transfers.",
        faqs: [
            { question: "Who is eligible for Ehsaas Emergency Cash?", answer: "Families earning less than PKR 30,000 per month are eligible. You must have a valid CNIC." },
            { question: "How do I apply?", answer: "Send your CNIC number to 8171 via SMS. You will receive a confirmation message if eligible." }
        ],
        stats: { beneficiaries: 12000000, budgetAllocated: 144000000000, applicationsReceived: 15000000 }
    },

    {
        schemeId: "PKS002",
        schemeName: "Prime Minister Youth Business Loan",
        shortName: "PM Youth Loan",
        category: "Financial Assistance",
        subCategory: "Business Development",
        department: "Prime Minister's Youth Program",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 500000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Training", "Mentorship Program", "Marketing Support"],
            duration: "Loan repayment over 5 years"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 21, max: 45 },
            categories: ["Youth", "Entrepreneur", "Business Owner"],
            employmentStatus: ["Self-Employed", "Unemployed", "Student"],
            educationLevel: ["Intermediate", "Bachelor's", "Master's", "Diploma"]
        },
        application: {
            method: "Online",
            website: "https://pmyouthprogram.gov.pk",
            steps: ["Register on PM Youth Program portal", "Submit business plan and required documents", "Attend business training session", "Wait for loan approval", "Sign loan agreement and receive funds"],
            requiredDocuments: ["CNIC", "Educational Certificates", "Business Plan (detailed)", "Bank Statements (last 6 months)", "Guarantor Documents"],
            processingTime: "30-45 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-111-989-989"],
            email: ["info@pmyouthprogram.gov.pk"],
            offices: [
                { city: "Islamabad", address: "PM Youth Program Office, G-5/2", phone: "051-111-989-989" },
                { city: "Lahore", address: "PM Youth Program Office, Gulberg III", phone: "042-111-989-989" }
            ],
            website: "https://pmyouthprogram.gov.pk"
        },
        launchDate: new Date("2013-11-01"),
        status: "Active",
        description: "Interest-free business loans for young entrepreneurs to start or expand their businesses",
        longDescription: "The PM Youth Business Loan Scheme provides financial support to young entrepreneurs aged 21-45 years. The program offers loans up to PKR 500,000 with easy repayment terms and includes business training and mentorship.",
        stats: { beneficiaries: 50000, budgetAllocated: 25000000000, applicationsReceived: 150000 }
    },

    {
        schemeId: "PKS003",
        schemeName: "Sehat Sahulat Card Program",
        shortName: "Sehat Card",
        category: "Healthcare",
        subCategory: "Medical Insurance",
        department: "Ministry of Health - Government of Pakistan",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 1000000, frequency: "Annual Coverage", currency: "PKR" },
            nonFinancial: ["Free hospitalization", "Free surgeries", "Free medicines during treatment", "Free diagnostic tests"],
            duration: "Annual renewal"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 0, max: 100 },
            categories: ["Low Income Family"],
            employmentStatus: ["Any"]
        },
        application: {
            method: "Automatic Registration",
            website: "https://pmhealthprogram.gov.pk",
            steps: ["Check eligibility via SMS (8500)", "Collect card from designated center with CNIC", "Use card at empaneled hospitals"],
            requiredDocuments: ["CNIC", "Family Registration Certificate"],
            processingTime: "Immediate (if eligible)",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245300", "8500"],
            email: ["info@pmhealthprogram.gov.pk"],
            offices: [{ city: "Islamabad", address: "PM Health Program, Ministry of Health", phone: "051-9245300" }],
            website: "https://pmhealthprogram.gov.pk"
        },
        launchDate: new Date("2015-12-31"),
        status: "Active",
        description: "Free medical treatment coverage up to PKR 1 million annually for low-income families",
        longDescription: "The Sehat Sahulat Card provides comprehensive health insurance coverage to low-income families across Pakistan. Cardholders can access free medical treatment at empaneled hospitals nationwide.",
        faqs: [
            { question: "What medical services are covered?", answer: "All indoor treatments, surgeries, medicines during hospitalization, and diagnostic tests are covered up to PKR 1 million per year." },
            { question: "Which hospitals accept Sehat Card?", answer: "Over 700 hospitals across Pakistan are empaneled. Check the website for the complete list." }
        ],
        stats: { beneficiaries: 8000000, budgetAllocated: 400000000000, applicationsReceived: 10000000 }
    },

    {
        schemeId: "PKS004",
        schemeName: "Benazir Income Support Programme",
        shortName: "BISP",
        category: "Financial Assistance",
        subCategory: "Social Safety Net",
        department: "Benazir Income Support Programme",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 9000, frequency: "Quarterly", currency: "PKR" },
            nonFinancial: ["Educational Scholarships for Children"],
            duration: "Ongoing (as long as eligible)"
        },
        eligibility: {
            income: { min: 0, max: 25000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Woman"],
            employmentStatus: ["Any"],
            gender: "Female"
        },
        application: {
            method: "Survey-based & Online",
            website: "https://bisp.gov.pk",
            steps: ["Wait for BISP survey team visit", "Provide accurate information during survey", "Check eligibility status online with CNIC", "Collect payment from designated bank/ATM"],
            requiredDocuments: ["CNIC", "Utility Bills", "Family Information"],
            processingTime: "Survey-dependent",
            isOpen: true
        },
        contact: {
            helpline: ["051-9246700"],
            email: ["complaints@bisp.gov.pk"],
            offices: [{ city: "Islamabad", address: "BISP Headquarters, Plot 5-C, G-5/2", phone: "051-9246700" }],
            website: "https://bisp.gov.pk"
        },
        launchDate: new Date("2008-07-01"),
        status: "Active",
        description: "Quarterly cash assistance for poor women to support their families",
        longDescription: "BISP provides unconditional cash transfers to poor women across Pakistan. The program aims to reduce poverty and empower women by providing them with financial resources.",
        stats: { beneficiaries: 9000000, budgetAllocated: 400000000000, applicationsReceived: 12000000 }
    },

    {
        schemeId: "PKS005",
        schemeName: "Kamyab Pakistan Program - Kamyab Karobar",
        shortName: "Kamyab Karobar",
        category: "Financial Assistance",
        subCategory: "Business Loans",
        department: "State Bank of Pakistan",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 10000000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Advisory Services"],
            duration: "Loan repayment up to 8 years"
        },
        eligibility: {
            income: { min: 0, max: 300000 },
            age: { min: 21, max: 60 },
            categories: ["Business Owner", "Entrepreneur", "Farmer"],
            employmentStatus: ["Self-Employed", "Business Owner"]
        },
        application: {
            method: "Through Participating Banks",
            website: "https://kamyabpakistan.gov.pk",
            steps: ["Visit participating bank branch", "Submit loan application with business plan", "Provide required documents", "Bank evaluation and approval", "Loan disbursement"],
            requiredDocuments: ["CNIC", "Business Registration", "Business Plan", "Financial Statements", "Collateral Documents"],
            processingTime: "45-60 days",
            isOpen: true
        },
        contact: {
            helpline: ["021-111-727-273"],
            email: ["info@kamyabpakistan.gov.pk"],
            offices: [{ city: "Karachi", address: "State Bank of Pakistan, I.I. Chundrigar Road", phone: "021-111-727-273" }],
            website: "https://kamyabpakistan.gov.pk"
        },
        launchDate: new Date("2021-10-01"),
        status: "Active",
        description: "Low-cost business loans for small and medium enterprises",
        longDescription: "Kamyab Karobar provides affordable financing to existing businesses and new entrepreneurs. The program offers loans up to PKR 10 million with subsidized markup rates.",
        stats: { beneficiaries: 25000, budgetAllocated: 50000000000, applicationsReceived: 75000 }
    },

    // NEW SCHEMES (20 more)
    {
        schemeId: "PKS006",
        schemeName: "Ehsaas Undergraduate Scholarship Program",
        shortName: "Ehsaas Scholarship",
        category: "Education",
        subCategory: "Higher Education",
        department: "Higher Education Commission (HEC)",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 48000, frequency: "Annual", currency: "PKR" },
            nonFinancial: ["Tuition Fee Coverage", "Books Allowance", "Hostel Subsidy"],
            duration: "4 years (Bachelor's degree)"
        },
        eligibility: {
            income: { min: 0, max: 45000 },
            age: { min: 17, max: 25 },
            categories: ["Student"],
            employmentStatus: ["Student"],
            educationLevel: ["Intermediate"]
        },
        application: {
            method: "Online",
            website: "https://hec.gov.pk/ehsaas",
            steps: ["Apply online through HEC portal", "Upload required documents", "Appear for interview if shortlisted", "Receive scholarship letter"],
            requiredDocuments: ["CNIC", "Intermediate Marksheet", "Income Certificate", "Admission Letter", "Bank Account Details"],
            processingTime: "60-90 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9047000"],
            email: ["scholarship@hec.gov.pk"],
            offices: [{ city: "Islamabad", address: "HEC Secretariat, H-9", phone: "051-9047000" }],
            website: "https://hec.gov.pk"
        },
        launchDate: new Date("2020-01-15"),
        status: "Active",
        description: "Merit-cum-need based scholarships for undergraduate students from low-income families",
        longDescription: "Ehsaas Undergraduate Scholarship provides financial support to talented students from economically disadvantaged backgrounds to pursue higher education.",
        stats: { beneficiaries: 50000, budgetAllocated: 2400000000, applicationsReceived: 200000 }
    },

    {
        schemeId: "PKS007",
        schemeName: "Punjab Rozgar Scheme",
        shortName: "Punjab Jobs",
        category: "Employment",
        subCategory: "Job Creation",
        department: "Punjab Skills Development Fund",
        province: "Punjab",
        cities: ["Lahore", "Faisalabad", "Multan", "Rawalpindi", "Gujranwala"],
        benefits: {
            financial: { amount: 25000, frequency: "Monthly Stipend", currency: "PKR" },
            nonFinancial: ["Vocational Training", "Job Placement", "Certification"],
            duration: "6 months training + job placement"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 18, max: 35 },
            categories: ["Youth", "Unemployed"],
            employmentStatus: ["Unemployed"],
            educationLevel: ["Matric", "Intermediate", "Bachelor's"]
        },
        application: {
            method: "Online & Walk-in",
            website: "https://psdf.org.pk",
            steps: ["Register online or visit PSDF office", "Select training course", "Complete training program", "Get job placement assistance"],
            requiredDocuments: ["CNIC", "Educational Certificates", "Domicile Certificate"],
            processingTime: "15-20 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-111-774-111"],
            email: ["info@psdf.org.pk"],
            offices: [{ city: "Lahore", address: "PSDF House, 3-Civic Centre, Barkat Market", phone: "042-111-774-111" }],
            website: "https://psdf.org.pk"
        },
        launchDate: new Date("2010-06-01"),
        status: "Active",
        description: "Vocational training and job placement program for unemployed youth in Punjab",
        longDescription: "Punjab Rozgar Scheme provides free vocational training in various trades and ensures job placement for trained individuals.",
        stats: { beneficiaries: 300000, budgetAllocated: 15000000000, applicationsReceived: 500000 }
    },

    {
        schemeId: "PKS008",
        schemeName: "Kisan Card Scheme",
        shortName: "Kisan Card",
        category: "Agriculture",
        subCategory: "Farmer Support",
        department: "Ministry of Agriculture",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 150000, frequency: "Annual Credit Limit", currency: "PKR" },
            nonFinancial: ["Subsidized Fertilizer", "Free Seeds", "Agricultural Training"],
            duration: "Annual renewal"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 18, max: 70 },
            categories: ["Farmer"],
            employmentStatus: ["Self-Employed", "Farmer"],
            specialConditions: ["Must own or lease agricultural land"]
        },
        application: {
            method: "Through Banks & Agriculture Department",
            website: "https://agripunjab.gov.pk",
            steps: ["Visit nearest agriculture office or bank", "Submit land ownership documents", "Get Kisan Card issued", "Use card for agricultural inputs"],
            requiredDocuments: ["CNIC", "Land Ownership Documents", "Fard", "Bank Account"],
            processingTime: "10-15 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203231"],
            email: ["info@agripunjab.gov.pk"],
            offices: [{ city: "Lahore", address: "Agriculture Department, 21-Davis Road", phone: "042-99203231" }],
            website: "https://agripunjab.gov.pk"
        },
        launchDate: new Date("2018-08-14"),
        status: "Active",
        description: "Interest-free credit facility for small farmers to purchase agricultural inputs",
        longDescription: "Kisan Card provides farmers with easy access to credit for buying seeds, fertilizers, and other agricultural necessities.",
        stats: { beneficiaries: 500000, budgetAllocated: 75000000000, applicationsReceived: 750000 }
    },

    {
        schemeId: "PKS009",
        schemeName: "Apna Ghar Housing Scheme",
        shortName: "Apna Ghar",
        category: "Housing",
        subCategory: "Low-Cost Housing",
        department: "Naya Pakistan Housing Authority",
        province: "Federal",
        cities: ["Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"],
        benefits: {
            financial: { amount: 3000000, frequency: "One-time Subsidy", currency: "PKR" },
            nonFinancial: ["Low-interest Mortgage", "Land Allocation", "Utilities Connection"],
            duration: "20-year mortgage plan"
        },
        eligibility: {
            income: { min: 25000, max: 80000 },
            age: { min: 21, max: 60 },
            categories: ["Low Income Family", "Middle Class"],
            employmentStatus: ["Employed", "Self-Employed"],
            specialConditions: ["Must not own a house"]
        },
        application: {
            method: "Online",
            website: "https://nphp.com.pk",
            steps: ["Register on NPHP portal", "Submit income and employment documents", "Apply for mortgage through partner banks", "Get allotment letter", "Start construction or purchase"],
            requiredDocuments: ["CNIC", "Income Certificate", "Employment Letter", "Bank Statements", "Non-ownership Certificate"],
            processingTime: "90-120 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-111-647-647"],
            email: ["info@nphp.com.pk"],
            offices: [{ city: "Islamabad", address: "NPHP Office, Blue Area", phone: "051-111-647-647" }],
            website: "https://nphp.com.pk"
        },
        launchDate: new Date("2019-04-01"),
        status: "Active",
        description: "Affordable housing scheme for low and middle-income families",
        longDescription: "Apna Ghar provides subsidized housing solutions with easy financing options for families who don't own a house.",
        stats: { beneficiaries: 100000, budgetAllocated: 300000000000, applicationsReceived: 500000 }
    },

    {
        schemeId: "PKS010",
        schemeName: "Sindh People's Housing for Flood Affectees",
        shortName: "Flood Housing",
        category: "Housing",
        subCategory: "Disaster Relief",
        department: "Sindh Government - Rehabilitation Department",
        province: "Sindh",
        cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana"],
        benefits: {
            financial: { amount: 300000, frequency: "One-time Grant", currency: "PKR" },
            nonFinancial: ["Construction Materials", "Technical Support"],
            duration: "One-time assistance"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 18, max: 100 },
            categories: ["Flood Affectee", "Low Income Family"],
            employmentStatus: ["Any"],
            specialConditions: ["Must be verified flood victim"]
        },
        application: {
            method: "Through District Administration",
            website: "https://sindh.gov.pk",
            steps: ["Register with district administration", "Get flood affectee certificate", "Submit damage assessment report", "Receive grant in installments"],
            requiredDocuments: ["CNIC", "Flood Affectee Certificate", "Damage Assessment Report", "Land Documents"],
            processingTime: "30-45 days",
            isOpen: true
        },
        contact: {
            helpline: ["021-99211765"],
            email: ["relief@sindh.gov.pk"],
            offices: [{ city: "Karachi", address: "Sindh Secretariat, Karachi", phone: "021-99211765" }],
            website: "https://sindh.gov.pk"
        },
        launchDate: new Date("2022-09-01"),
        status: "Active",
        description: "Financial assistance for flood-affected families to rebuild their homes",
        longDescription: "This scheme provides grants to families whose homes were damaged or destroyed in floods to help them rebuild.",
        stats: { beneficiaries: 150000, budgetAllocated: 45000000000, applicationsReceived: 200000 }
    },

    {
        schemeId: "PKS011",
        schemeName: "Laptop Scheme for Students",
        shortName: "PM Laptop",
        category: "Education",
        subCategory: "Digital Education",
        department: "Higher Education Commission",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 0, frequency: "One-time", currency: "PKR" },
            nonFinancial: ["Free Laptop", "Internet Package", "Software Bundle"],
            duration: "One-time distribution"
        },
        eligibility: {
            income: { min: 0, max: 60000 },
            age: { min: 18, max: 30 },
            categories: ["Student"],
            employmentStatus: ["Student"],
            educationLevel: ["Bachelor's", "Master's"],
            specialConditions: ["Minimum 3.0 CGPA required"]
        },
        application: {
            method: "Online",
            website: "https://pmlaptop.gov.pk",
            steps: ["Apply online with student credentials", "Upload academic documents", "Wait for merit list", "Collect laptop from designated center"],
            requiredDocuments: ["CNIC", "Student ID Card", "Latest Transcript", "Income Certificate"],
            processingTime: "60 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9047000"],
            email: ["laptop@hec.gov.pk"],
            offices: [{ city: "Islamabad", address: "HEC Secretariat, H-9", phone: "051-9047000" }],
            website: "https://pmlaptop.gov.pk"
        },
        launchDate: new Date("2014-02-01"),
        status: "Active",
        description: "Free laptops for high-achieving university students",
        longDescription: "PM Laptop Scheme distributes free laptops to talented students to facilitate digital learning and research.",
        stats: { beneficiaries: 500000, budgetAllocated: 50000000000, applicationsReceived: 1000000 }
    },

    {
        schemeId: "PKS012",
        schemeName: "Khyber Pakhtunkhwa Sehat Card Plus",
        shortName: "KP Sehat Card",
        category: "Healthcare",
        subCategory: "Health Insurance",
        department: "KP Health Department",
        province: "KPK",
        cities: [],
        benefits: {
            financial: { amount: 1000000, frequency: "Annual Coverage", currency: "PKR" },
            nonFinancial: ["Free OPD Services", "Free Medicines", "Free Diagnostics"],
            duration: "Annual renewal"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 0, max: 100 },
            categories: ["Any"],
            employmentStatus: ["Any"],
            specialConditions: ["Must be KP resident"]
        },
        application: {
            method: "Automatic for all KP residents",
            website: "https://sehatcard.kp.gov.pk",
            steps: ["Verify CNIC at any empaneled hospital", "Get card issued", "Use for treatment"],
            requiredDocuments: ["CNIC", "Proof of KP residence"],
            processingTime: "Immediate",
            isOpen: true
        },
        contact: {
            helpline: ["091-9213030"],
            email: ["info@sehatcard.kp.gov.pk"],
            offices: [{ city: "Peshawar", address: "KP Health Department, Peshawar", phone: "091-9213030" }],
            website: "https://sehatcard.kp.gov.pk"
        },
        launchDate: new Date("2016-01-01"),
        status: "Active",
        description: "Universal health coverage for all KP residents with free medical treatment",
        longDescription: "KP Sehat Card Plus provides comprehensive health insurance to all residents of Khyber Pakhtunkhwa province.",
        stats: { beneficiaries: 7000000, budgetAllocated: 350000000000, applicationsReceived: 8000000 }
    },

    {
        schemeId: "PKS013",
        schemeName: "Balochistan Education Endowment Fund",
        shortName: "BEEF Scholarship",
        category: "Education",
        subCategory: "Scholarships",
        department: "Balochistan Education Department",
        province: "Balochistan",
        cities: [],
        benefits: {
            financial: { amount: 60000, frequency: "Annual", currency: "PKR" },
            nonFinancial: ["Tuition Coverage", "Books", "Accommodation Support"],
            duration: "4-5 years (degree duration)"
        },
        eligibility: {
            income: { min: 0, max: 40000 },
            age: { min: 17, max: 25 },
            categories: ["Student"],
            employmentStatus: ["Student"],
            educationLevel: ["Intermediate"],
            specialConditions: ["Balochistan domicile required"]
        },
        application: {
            method: "Online",
            website: "https://beef.gob.pk",
            steps: ["Apply online through BEEF portal", "Submit documents", "Appear for test/interview", "Receive scholarship award letter"],
            requiredDocuments: ["CNIC", "Domicile", "Academic Certificates", "Income Certificate"],
            processingTime: "45-60 days",
            isOpen: true
        },
        contact: {
            helpline: ["081-9201346"],
            email: ["info@beef.gob.pk"],
            offices: [{ city: "Quetta", address: "BEEF Office, Quetta", phone: "081-9201346" }],
            website: "https://beef.gob.pk"
        },
        launchDate: new Date("2012-09-01"),
        status: "Active",
        description: "Scholarships for talented students from Balochistan for higher education",
        longDescription: "BEEF provides financial support to deserving students from Balochistan to pursue higher education in Pakistan and abroad.",
        stats: { beneficiaries: 15000, budgetAllocated: 900000000, applicationsReceived: 50000 }
    },

    {
        schemeId: "PKS014",
        schemeName: "Ehsaas Nashonuma Program",
        shortName: "Nashonuma",
        category: "Healthcare",
        subCategory: "Nutrition",
        department: "Ehsaas Program",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 2000, frequency: "Monthly", currency: "PKR" },
            nonFinancial: ["Nutrition Supplements", "Health Monitoring", "Counseling"],
            duration: "2 years (for children 0-2 years)"
        },
        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 15, max: 49 },
            categories: ["Woman", "Mother"],
            employmentStatus: ["Any"],
            gender: "Female",
            specialConditions: ["Pregnant or lactating mothers, or mothers with children under 2"]
        },
        application: {
            method: "Through Nashonuma Centers",
            website: "https://ehsaas.gov.pk/nashonuma",
            steps: ["Visit nearest Nashonuma center", "Register with CNIC", "Get health assessment", "Receive monthly stipend and supplements"],
            requiredDocuments: ["CNIC", "Child Birth Certificate (if applicable)"],
            processingTime: "Same day",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245100"],
            email: ["nashonuma@ehsaas.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ehsaas Program Office", phone: "051-9245100" }],
            website: "https://ehsaas.gov.pk"
        },
        launchDate: new Date("2018-07-01"),
        status: "Active",
        description: "Nutrition program for pregnant/lactating women and children under 2 years",
        longDescription: "Nashonuma aims to reduce stunting in children by providing nutritional support and cash transfers to mothers.",
        stats: { beneficiaries: 200000, budgetAllocated: 4800000000, applicationsReceived: 300000 }
    },

    {
        schemeId: "PKS015",
        schemeName: "Green Tractor Scheme",
        shortName: "Tractor Scheme",
        category: "Agriculture",
        subCategory: "Farm Mechanization",
        department: "Ministry of Agriculture",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 1000000, frequency: "One-time Subsidy", currency: "PKR" },
            nonFinancial: ["Tractor at Subsidized Rate", "Training", "Maintenance Support"],
            duration: "One-time purchase"
        },
        eligibility: {
            income: { min: 0, max: 150000 },
            age: { min: 21, max: 65 },
            categories: ["Farmer"],
            employmentStatus: ["Farmer", "Self-Employed"],
            specialConditions: ["Must own at least 12.5 acres of land"]
        },
        application: {
            method: "Through Agriculture Department",
            website: "https://agriculture.gov.pk",
            steps: ["Apply at district agriculture office", "Submit land documents", "Get approval", "Purchase tractor from authorized dealer", "Receive subsidy"],
            requiredDocuments: ["CNIC", "Land Ownership Documents", "Fard", "Income Certificate"],
            processingTime: "30-45 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9205711"],
            email: ["info@agriculture.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ministry of Agriculture, Islamabad", phone: "051-9205711" }],
            website: "https://agriculture.gov.pk"
        },
        launchDate: new Date("2020-11-01"),
        status: "Active",
        description: "Subsidized tractors for small and medium farmers to promote mechanization",
        longDescription: "Green Tractor Scheme provides financial assistance to farmers for purchasing tractors at subsidized rates.",
        stats: { beneficiaries: 50000, budgetAllocated: 50000000000, applicationsReceived: 100000 }
    },

    {
        schemeId: "PKS016",
        schemeName: "Ehsaas Interest Free Loan",
        shortName: "Ehsaas Qarz-e-Hasana",
        category: "Financial Assistance",
        subCategory: "Microfinance",
        department: "Ehsaas Program",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 50000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Training", "Mentorship"],
            duration: "12-month repayment"
        },
        eligibility: {
            income: { min: 0, max: 35000 },
            age: { min: 21, max: 60 },
            categories: ["Low Income Family", "Entrepreneur"],
            employmentStatus: ["Self-Employed", "Unemployed"]
        },
        application: {
            method: "Through Ehsaas Centers",
            website: "https://ehsaas.gov.pk",
            steps: ["Visit Ehsaas center", "Submit business plan", "Get approval", "Receive loan", "Start business"],
            requiredDocuments: ["CNIC", "Business Plan", "Guarantor CNIC"],
            processingTime: "15-20 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245100"],
            email: ["qarz@ehsaas.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ehsaas Program Office", phone: "051-9245100" }],
            website: "https://ehsaas.gov.pk"
        },
        launchDate: new Date("2019-10-01"),
        status: "Active",
        description: "Interest-free microloans for poor families to start small businesses",
        longDescription: "Ehsaas Interest Free Loan provides small loans without interest to help poor families become self-reliant.",
        stats: { beneficiaries: 300000, budgetAllocated: 15000000000, applicationsReceived: 500000 }
    },

    {
        schemeId: "PKS017",
        schemeName: "Punjab Daanish Schools Program",
        shortName: "Daanish Schools",
        category: "Education",
        subCategory: "School Education",
        department: "Punjab Education Department",
        province: "Punjab",
        cities: ["Dera Ghazi Khan", "Mianwali", "Muzaffargarh", "Rajanpur"],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Education", "Free Boarding", "Free Meals", "Free Books", "Free Uniform"],
            duration: "Class 6 to 12"
        },
        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 10, max: 14 },
            categories: ["Student"],
            employmentStatus: ["Student"],
            educationLevel: ["Primary"],
            specialConditions: ["Must pass entrance test"]
        },
        application: {
            method: "Through Schools",
            website: "https://daanishschools.punjab.gov.pk",
            steps: ["Apply online or at school", "Appear for entrance test", "Submit documents", "Get admission letter"],
            requiredDocuments: ["CNIC (Parent)", "Birth Certificate", "Income Certificate", "Academic Records"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-99203231"],
            email: ["info@daanishschools.punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "Punjab Education Department, Lahore", phone: "042-99203231" }],
            website: "https://daanishschools.punjab.gov.pk"
        },
        launchDate: new Date("2011-01-01"),
        status: "Active",
        description: "Free residential education for talented students from poor families",
        longDescription: "Daanish Schools provide world-class education with boarding facilities to deserving students from underprivileged backgrounds.",
        stats: { beneficiaries: 5000, budgetAllocated: 2000000000, applicationsReceived: 20000 }
    },

    {
        schemeId: "PKS018",
        schemeName: "Kamyab Jawan Sports Drive",
        shortName: "Sports Drive",
        category: "Sports",
        subCategory: "Youth Development",
        department: "Ministry of Inter-Provincial Coordination",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 100000, frequency: "Annual Stipend", currency: "PKR" },
            nonFinancial: ["Sports Equipment", "Coaching", "Competition Participation", "Nutrition Support"],
            duration: "Annual (renewable)"
        },
        eligibility: {
            income: { min: 0, max: 80000 },
            age: { min: 15, max: 25 },
            categories: ["Youth", "Athlete"],
            employmentStatus: ["Student", "Unemployed"],
            specialConditions: ["Must be registered athlete"]
        },
        application: {
            method: "Through Sports Boards",
            website: "https://kamyabjawan.gov.pk/sports",
            steps: ["Register with provincial sports board", "Apply for sports drive", "Submit performance records", "Get selected", "Receive stipend and support"],
            requiredDocuments: ["CNIC", "Sports Performance Records", "Coach Recommendation", "Medical Certificate"],
            processingTime: "30 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9206881"],
            email: ["sports@kamyabjawan.gov.pk"],
            offices: [{ city: "Islamabad", address: "Pakistan Sports Complex, Islamabad", phone: "051-9206881" }],
            website: "https://kamyabjawan.gov.pk"
        },
        launchDate: new Date("2020-03-01"),
        status: "Active",
        description: "Financial and technical support for young athletes from low-income families",
        longDescription: "Kamyab Jawan Sports Drive nurtures young talent by providing financial assistance and world-class training facilities.",
        stats: { beneficiaries: 10000, budgetAllocated: 1000000000, applicationsReceived: 30000 }
    },

    {
        schemeId: "PKS019",
        schemeName: "Sindh Solar Panel Scheme",
        shortName: "Solar Scheme",
        category: "Energy",
        subCategory: "Renewable Energy",
        department: "Sindh Energy Department",
        province: "Sindh",
        cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Mirpurkhas"],
        benefits: {
            financial: { amount: 150000, frequency: "One-time Subsidy", currency: "PKR" },
            nonFinancial: ["Solar Panel Installation", "Net Metering", "Technical Support"],
            duration: "One-time installation"
        },
        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 18, max: 100 },
            categories: ["Any"],
            employmentStatus: ["Any"],
            specialConditions: ["Must own a house"]
        },
        application: {
            method: "Online & Through K-Electric/HESCO",
            website: "https://energy.sindh.gov.pk",
            steps: ["Apply online", "Get site survey done", "Receive subsidy approval", "Install solar panels", "Get net metering connection"],
            requiredDocuments: ["CNIC", "Electricity Bill", "House Ownership Documents"],
            processingTime: "45-60 days",
            isOpen: true
        },
        contact: {
            helpline: ["021-99211234"],
            email: ["solar@sindh.gov.pk"],
            offices: [{ city: "Karachi", address: "Sindh Energy Department, Karachi", phone: "021-99211234" }],
            website: "https://energy.sindh.gov.pk"
        },
        launchDate: new Date("2021-06-01"),
        status: "Active",
        description: "Subsidized solar panel installation for residential consumers",
        longDescription: "Sindh Solar Panel Scheme promotes renewable energy by providing subsidies for solar panel installation.",
        stats: { beneficiaries: 25000, budgetAllocated: 3750000000, applicationsReceived: 50000 }
    },

    {
        schemeId: "PKS020",
        schemeName: "Ehsaas Amdan Program",
        shortName: "Amdan",
        category: "Financial Assistance",
        subCategory: "Income Generation",
        department: "Ehsaas Program",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 12000, frequency: "Monthly", currency: "PKR" },
            nonFinancial: ["Skills Training", "Asset Transfer", "Business Support"],
            duration: "12 months"
        },
        eligibility: {
            income: { min: 0, max: 20000 },
            age: { min: 18, max: 60 },
            categories: ["Low Income Family", "Woman"],
            employmentStatus: ["Unemployed", "Self-Employed"],
            gender: "Female"
        },
        application: {
            method: "Through Ehsaas Centers",
            website: "https://ehsaas.gov.pk/amdan",
            steps: ["Visit Ehsaas center", "Enroll in skills training", "Complete training", "Receive asset/capital", "Start earning"],
            requiredDocuments: ["CNIC", "Income Certificate", "BISP Registration (if applicable)"],
            processingTime: "15 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245100"],
            email: ["amdan@ehsaas.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ehsaas Program Office", phone: "051-9245100" }],
            website: "https://ehsaas.gov.pk"
        },
        launchDate: new Date("2020-08-01"),
        status: "Active",
        description: "Income generation program for poor women through skills training and asset transfer",
        longDescription: "Ehsaas Amdan helps women become financially independent through vocational training and startup capital.",
        stats: { beneficiaries: 100000, budgetAllocated: 14400000000, applicationsReceived: 200000 }
    },

    {
        schemeId: "PKS021",
        schemeName: "Pakistan Bait-ul-Mal Individual Financial Assistance",
        shortName: "PBM Assistance",
        category: "Financial Assistance",
        subCategory: "Emergency Relief",
        department: "Pakistan Bait-ul-Mal",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 50000, frequency: "One-time", currency: "PKR" },
            nonFinancial: ["Medical Support", "Education Support"],
            duration: "One-time assistance"
        },
        eligibility: {
            income: { min: 0, max: 25000 },
            age: { min: 0, max: 100 },
            categories: ["Low Income Family", "Disabled", "Orphan", "Widow"],
            employmentStatus: ["Any"]
        },
        application: {
            method: "Walk-in at PBM Offices",
            website: "https://pbm.gov.pk",
            steps: ["Visit nearest PBM office", "Submit application with documents", "Get verification done", "Receive financial assistance"],
            requiredDocuments: ["CNIC", "Income Certificate", "Medical Certificate (if applicable)", "Disability Certificate (if applicable)"],
            processingTime: "7-15 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9223081"],
            email: ["info@pbm.gov.pk"],
            offices: [{ city: "Islamabad", address: "Pakistan Bait-ul-Mal, G-5/2", phone: "051-9223081" }],
            website: "https://pbm.gov.pk"
        },
        launchDate: new Date("1992-01-01"),
        status: "Active",
        description: "Emergency financial assistance for destitute, widows, orphans, and disabled persons",
        longDescription: "PBM provides one-time financial assistance to the most vulnerable segments of society in times of need.",
        stats: { beneficiaries: 500000, budgetAllocated: 25000000000, applicationsReceived: 1000000 }
    },

    {
        schemeId: "PKS022",
        schemeName: "Hunarmand Pakistan Program",
        shortName: "Hunarmand",
        category: "Employment",
        subCategory: "Skills Development",
        department: "National Vocational & Technical Training Commission",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 30000, frequency: "Training Stipend", currency: "PKR" },
            nonFinancial: ["Free Vocational Training", "Certification", "Job Placement", "Tools/Equipment"],
            duration: "3-12 months (course dependent)"
        },
        eligibility: {
            income: { min: 0, max: 60000 },
            age: { min: 16, max: 40 },
            categories: ["Youth", "Unemployed"],
            employmentStatus: ["Unemployed", "Student"],
            educationLevel: ["Matric", "Intermediate", "Bachelor's"]
        },
        application: {
            method: "Online",
            website: "https://navttc.gov.pk",
            steps: ["Register online", "Select training course", "Enroll in nearest training center", "Complete training", "Get certification and job placement"],
            requiredDocuments: ["CNIC", "Educational Certificates", "Passport Size Photos"],
            processingTime: "10-15 days",
            isOpen: true
        },
        contact: {
            helpline: ["051-9207518"],
            email: ["info@navttc.gov.pk"],
            offices: [{ city: "Islamabad", address: "NAVTTC Headquarters, Plot 38, H-9", phone: "051-9207518" }],
            website: "https://navttc.gov.pk"
        },
        launchDate: new Date("2019-05-01"),
        status: "Active",
        description: "Free vocational and technical training for youth with job placement support",
        longDescription: "Hunarmand Pakistan provides market-driven skills training to youth to enhance their employability.",
        stats: { beneficiaries: 500000, budgetAllocated: 15000000000, applicationsReceived: 1000000 }
    },

    {
        schemeId: "PKS023",
        schemeName: "Punjab Masstransit Authority Free Travel for Students",
        shortName: "Metro Free Travel",
        category: "Transportation",
        subCategory: "Student Welfare",
        department: "Punjab Masstransit Authority",
        province: "Punjab",
        cities: ["Lahore", "Rawalpindi", "Multan"],
        benefits: {
            financial: { amount: 0, frequency: "Free", currency: "PKR" },
            nonFinancial: ["Free Metro Bus Travel", "Free Orange Line Travel"],
            duration: "Ongoing (during student status)"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 15, max: 25 },
            categories: ["Student"],
            employmentStatus: ["Student"],
            educationLevel: ["Matric", "Intermediate", "Bachelor's", "Master's"]
        },
        application: {
            method: "At Metro Stations",
            website: "https://pma.punjab.gov.pk",
            steps: ["Visit metro station with student ID", "Get student travel card", "Use for free travel"],
            requiredDocuments: ["Student ID Card", "CNIC/B-Form", "Fee Receipt"],
            processingTime: "Same day",
            isOpen: true
        },
        contact: {
            helpline: ["042-111-786-786"],
            email: ["info@pma.punjab.gov.pk"],
            offices: [{ city: "Lahore", address: "PMA Office, Lahore", phone: "042-111-786-786" }],
            website: "https://pma.punjab.gov.pk"
        },
        launchDate: new Date("2015-02-01"),
        status: "Active",
        description: "Free metro bus and orange line travel for students from low-income families",
        longDescription: "This scheme provides free public transport to students to reduce their commuting costs.",
        stats: { beneficiaries: 200000, budgetAllocated: 2000000000, applicationsReceived: 250000 }
    },

    {
        schemeId: "PKS024",
        schemeName: "Ehsaas Kifalat Program",
        shortName: "Kifalat",
        category: "Financial Assistance",
        subCategory: "Social Protection",
        department: "Ehsaas Program",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 14000, frequency: "Quarterly", currency: "PKR" },
            nonFinancial: ["Priority in other Ehsaas programs"],
            duration: "Ongoing (as long as eligible)"
        },
        eligibility: {
            income: { min: 0, max: 25000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Woman", "Widow"],
            employmentStatus: ["Any"],
            gender: "Female"
        },
        application: {
            method: "Survey-based",
            website: "https://ehsaas.gov.pk",
            steps: ["Wait for Ehsaas survey", "Provide accurate information", "Check eligibility online", "Collect payment from bank/ATM"],
            requiredDocuments: ["CNIC", "Family Information"],
            processingTime: "Survey-dependent",
            isOpen: true
        },
        contact: {
            helpline: ["051-9245100"],
            email: ["kifalat@ehsaas.gov.pk"],
            offices: [{ city: "Islamabad", address: "Ehsaas Program Office", phone: "051-9245100" }],
            website: "https://ehsaas.gov.pk"
        },
        launchDate: new Date("2019-01-01"),
        status: "Active",
        description: "Unconditional cash transfers to poorest women for poverty alleviation",
        longDescription: "Ehsaas Kifalat is the flagship cash transfer program providing financial support to the most vulnerable women.",
        stats: { beneficiaries: 9000000, budgetAllocated: 504000000000, applicationsReceived: 12000000 }
    },

    {
        schemeId: "PKS025",
        schemeName: "Youth Business Loan - Akhuwat",
        shortName: "Akhuwat Youth",
        category: "Financial Assistance",
        subCategory: "Microfinance",
        department: "Akhuwat Foundation (Govt Partnership)",
        province: "Federal",
        cities: [],
        benefits: {
            financial: { amount: 100000, frequency: "One-time Loan", currency: "PKR" },
            nonFinancial: ["Business Mentoring", "Skills Training"],
            duration: "18-month repayment"
        },
        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 18, max: 35 },
            categories: ["Youth", "Entrepreneur"],
            employmentStatus: ["Unemployed", "Self-Employed"]
        },
        application: {
            method: "Through Akhuwat Offices",
            website: "https://akhuwat.org.pk",
            steps: ["Visit Akhuwat office", "Submit business plan", "Attend interview", "Get loan approval", "Receive funds"],
            requiredDocuments: ["CNIC", "Business Plan", "Guarantor Documents"],
            processingTime: "15-20 days",
            isOpen: true
        },
        contact: {
            helpline: ["042-37236280"],
            email: ["info@akhuwat.org.pk"],
            offices: [{ city: "Lahore", address: "Akhuwat Islamic Microfinance, Lahore", phone: "042-37236280" }],
            website: "https://akhuwat.org.pk"
        },
        launchDate: new Date("2017-03-01"),
        status: "Active",
        description: "Interest-free microloans for young entrepreneurs to start small businesses",
        longDescription: "Akhuwat Youth Business Loan provides interest-free financing to young people to help them become self-employed.",
        stats: { beneficiaries: 75000, budgetAllocated: 7500000000, applicationsReceived: 150000 }
    }
];

// Seed function
const seedSchemes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
        console.log('✅ MongoDB Connected');

        // Clear existing schemes
        await Scheme.deleteMany({});
        console.log('🗑️  Cleared existing schemes');

        // Insert sample schemes
        const result = await Scheme.insertMany(sampleSchemes);
        console.log(`✅ Successfully seeded ${result.length} schemes`);

        // Display summary
        console.log('\n📊 Seeded Schemes Summary:');
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
                console.log(`    Province: ${scheme.province} | Benefit: PKR ${scheme.benefits.financial.amount.toLocaleString()}`);
            });
        });

        console.log('\n═'.repeat(80));
        console.log(`\n✅ Total: ${result.length} schemes across ${Object.keys(byCategory).length} categories`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding schemes:', error);
        process.exit(1);
    }
};

// Run seed function
seedSchemes();
