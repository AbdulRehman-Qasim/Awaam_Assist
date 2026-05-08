const mongoose = require('mongoose');
require('dotenv').config();
const Hospital = require('../models/HospitalSchema');

const hospitals = [
    {
        SerialNum: 1,
        City: "Attock",
        Tehsil: "Hazro",
        "Hospital Name": "Ameer Abdullah Memorial Hospital Hazro",
        Cateogry: "Private"
    },
    {
        SerialNum: 2,
        City: "Attock",
        Tehsil: "Pindi Gheb",
        "Hospital Name": "Pakistan Oil Field Limited Hospital",
        Cateogry: "Private"
    }
];

const seedHospitals = async () => {
    try {
        // Connect to the database
        // Using the connection string from server.js since .env might not be set up for this script context or might differ
        await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
        console.log('MongoDB Connected');

        // Clear existing hospitals to avoid duplicates (optional, but good for seeding)
        await Hospital.deleteMany({});
        console.log('Cleared existing hospitals');

        // Insert new data
        await Hospital.insertMany(hospitals);
        console.log('Hospitals seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding hospitals:', error);
        process.exit(1);
    }
};

seedHospitals();
