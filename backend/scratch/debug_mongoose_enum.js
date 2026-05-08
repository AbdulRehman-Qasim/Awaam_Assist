
const mongoose = require('mongoose');
const University = require('../src/models/UniversitySchema');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
    
    // Query through Mongoose Model (which has the enum)
    const query = { status: '1' };
    const countWithModel = await University.countDocuments(query);
    
    // Query through raw MongoDB Collection (bypassing Mongoose validation/casting)
    const countWithRaw = await mongoose.connection.db.collection('universities').countDocuments(query);
    
    console.log('Count with Mongoose Model:', countWithModel);
    console.log('Count with Raw Collection:', countWithRaw);
    
    process.exit();
}

check();
