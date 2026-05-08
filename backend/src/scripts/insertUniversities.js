const mongoose = require('mongoose');
const University = require('../models/UniversitySchema');
const fs = require('fs');

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0';

async function insertUniversities() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        // Read and parse the JSON file
        const jsonPath = '../../../frontendsample/campusfinder_cleaned.json';
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const universitiesData = JSON.parse(rawData);

        console.log(`Found ${universitiesData.length} universities in JSON file`);

        // Clear existing data
        await University.deleteMany({});
        console.log('Cleared existing university data');

        // Transform and insert data
        const transformedData = universitiesData.map(uni => ({
            admissions: uni.admissions || "0.0",
            city: uni.city || '',
            contact: uni.contact || '',
            degree: uni.degree || '',
            discipline: uni.discipline || '',
            fee: uni.fee || 0,
            id: uni.id || '',
            info: uni.info || '',
            key: uni.key || 0,
            logo: uni.logo || '',
            merit: uni.merit || 0,
            province: uni.province || '',
            ranking: uni.ranking || 0,
            status: uni.status || 1,
            title: uni.title || '',
            url: uni.url || '',
            web: uni.web || '',
            deadline: uni.deadline || '',
            admission: uni.admission || '',
            map: {
                address: uni['map.address'] || '',
                lat: uni['map.lat'] || 0,
                location: uni['map.location'] || uni.city || '',
                long: uni['map.long'] || 0
            }
        }));

        // Insert all data in one operation
        const result = await University.insertMany(transformedData);
        console.log(`Successfully inserted ${result.length} universities into MongoDB Atlas`);

        // Create indexes
        await University.createIndexes([
            { city: 1 },
            { province: 1 },
            { discipline: 1 },
            { degree: 1 },
            { title: "text" }
        ]);
        console.log('Indexes created successfully');

    } catch (error) {
        console.error('Error inserting universities:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
insertUniversities();
