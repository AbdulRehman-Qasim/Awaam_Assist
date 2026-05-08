const mongoose = require('mongoose');
const Scheme = require('./src/models/SchemeSchema');
const schemes = require('./src/data/schemes52to100.json');
mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0').then(async () => {
  await Scheme.insertMany(schemes);
  const total = await Scheme.countDocuments();
  console.log('Added 49 schemes. Total:', total);
  process.exit(0);
}).catch(err => { console.error(err.message); process.exit(1); });
