const mongoose = require('mongoose');
const Hospital = require('./backend/src/models/HospitalSchema');
require('dotenv').config({ path: './backend/.env' });

async function checkData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
  
  const latest = await Hospital.find().sort({ createdAt: -1 }).limit(5);
  console.log("Latest 5 records:");
  latest.forEach(h => {
    console.log(`ID: ${h._id}, Name: ${h['Hospital Name']}, Specialty: ${h.treatmentSpecialty}, LegacySpecialty: ${h.specialization}, info: ${h.info}`);
  });
  
  process.exit();
}

checkData();
