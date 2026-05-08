const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0')
.then(async () => {
  const University = require('./src/models/UniversitySchema');
  
  // Check available disciplines with computer
  const disciplines = await University.distinct('discipline');
  console.log('Available disciplines containing "computer":');
  disciplines.filter(d => d && d.toLowerCase().includes('computer')).forEach(d => console.log(`- "${d}"`));
  
  // Check Computer Science specifically
  const csUnis = await University.find({discipline: /computer/i}).select('title discipline').limit(5);
  console.log('\nComputer Science related universities:');
  csUnis.forEach(uni => console.log(`- ${uni.title}: "${uni.discipline}"`));
  
  // Check exact match
  const exactCS = await University.find({discipline: "Computer Science"}).countDocuments();
  console.log(`\nExact "Computer Science" matches: ${exactCS}`);
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
