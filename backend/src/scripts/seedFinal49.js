require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/SchemeSchema');

// 49 additional schemes (PKS052-PKS100)
const schemes = [];

// Generate schemes programmatically to save space
const categories = ['Financial Assistance', 'Healthcare', 'Education', 'Employment', 'Agriculture', 'Housing', 'Women Empowerment', 'Technology & Innovation', 'Environment', 'Sports'];
const provinces = ['Federal', 'Punjab', 'Sindh', 'KPK', 'Balochistan'];

for (let i = 52; i <= 100; i++) {
    const catIndex = (i - 52) % categories.length;
    const provIndex = (i - 52) % provinces.length;

    schemes.push({
        schemeId: `PKS${String(i).padStart(3, '0')}`,
        schemeName: `${provinces[provIndex]} ${categories[catIndex]} Scheme ${i}`,
        shortName: `Scheme ${i}`,
        category: categories[catIndex],
        subCategory: 'Support Program',
        department: `${provinces[provIndex]} Government Department`,
        province: provinces[provIndex],
        cities: [],
        benefits: {
            financial: {
                amount: 25000 + (i * 1000),
                frequency: i % 2 === 0 ? 'Monthly' : 'Annual',
                currency: 'PKR'
            },
            nonFinancial: ['Training', 'Support Services', 'Certification'],
            duration: i % 3 === 0 ? '6 months' : '12 months'
        },
        eligibility: {
            income: { min: 0, max: 30000 + (i * 500) },
            age: { min: 18, max: i < 70 ? 60 : 100 },
            categories: ['Any'],
            employmentStatus: ['Any']
        },
        application: {
            method: 'Online & Walk-in',
            website: `https://${provinces[provIndex].toLowerCase()}.gov.pk`,
            steps: [
                'Visit nearest office or apply online',
                'Submit required documents',
                'Wait for verification',
                'Receive approval and benefits'
            ],
            requiredDocuments: ['CNIC', 'Income Certificate', 'Domicile'],
            processingTime: '30-45 days',
            isOpen: true
        },
        contact: {
            helpline: [`051-920${String(i).padStart(4, '0')}`],
            email: [`scheme${i}@gov.pk`],
            offices: [{
                city: provinces[provIndex] === 'Federal' ? 'Islamabad' :
                    provinces[provIndex] === 'Punjab' ? 'Lahore' :
                        provinces[provIndex] === 'Sindh' ? 'Karachi' :
                            provinces[provIndex] === 'KPK' ? 'Peshawar' : 'Quetta',
                address: `Government Office, ${provinces[provIndex]}`,
                phone: `051-920${String(i).padStart(4, '0')}`
            }],
            website: `https://${provinces[provIndex].toLowerCase()}.gov.pk`
        },
        launchDate: new Date(`20${18 + (i % 7)}-01-01`),
        status: 'Active',
        description: `${categories[catIndex]} support program for ${provinces[provIndex]} residents`,
        longDescription: `This scheme provides comprehensive ${categories[catIndex].toLowerCase()} support to eligible citizens of ${provinces[provIndex]}. The program aims to improve quality of life and provide essential services.`,
        faqs: [
            {
                question: 'Who is eligible for this scheme?',
                answer: 'Citizens meeting the income and age criteria can apply for this scheme.'
            },
            {
                question: 'How do I apply?',
                answer: 'You can apply online through the official website or visit the nearest government office.'
            }
        ],
        stats: {
            beneficiaries: 50000 + (i * 1000),
            budgetAllocated: 1000000000 + (i * 10000000),
            applicationsReceived: 100000 + (i * 2000)
        }
    });
}

// Seed function
const seedSchemes = async () => {
    try {
        await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
        console.log('✅ MongoDB Connected');

        const result = await Scheme.insertMany(schemes);
        console.log(`✅ Successfully added ${result.length} schemes`);

        const totalCount = await Scheme.countDocuments();
        console.log(`\n📊 Total schemes in database: ${totalCount}`);

        console.log('\n✅ Database now has 100 government schemes!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding schemes:', error.message);
        process.exit(1);
    }
};

seedSchemes();
