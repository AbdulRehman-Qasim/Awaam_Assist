const mongoose = require('mongoose');
const University = require('./src/models/UniversitySchema');

async function testDB() {
  try {
    await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
    console.log('Connected to MongoDB');
    
    const count = await University.countDocuments();
    console.log('Total universities in DB:', count);
    
    const federal = await University.find({title: {$regex: 'federal', $options: 'i'}});
    console.log('Federal universities found:', federal.length);
    
    if (federal.length > 0) {
      console.log('First federal uni:', federal[0].title);
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

testDB();
