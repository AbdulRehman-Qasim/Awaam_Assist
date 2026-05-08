
const mongoose = require('mongoose');
const University = require('../src/models/UniversitySchema');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
    
    const query = {
        $or: [
            { status: 'approved' },
            { status: { $exists: false } },
            { status: 1 },
            { status: '1' }
        ]
    };
    
    const countWithQuery = await University.countDocuments(query);
    const totalCount = await University.countDocuments();
    const sample = await University.findOne();
    
    console.log('Count with query:', countWithQuery);
    console.log('Total count:', totalCount);
    console.log('Sample status:', sample ? sample.status : 'none');
    console.log('Sample raw:', JSON.stringify(sample, null, 2));
    
    process.exit();
}

check();
