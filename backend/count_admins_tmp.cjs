const mongoose = require('mongoose');
const Admin = require('./src/models/AdminSchema');
(async () => {
  try {
    await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
    const count = await Admin.countDocuments();
    console.log('ADMINS_COUNT=' + count);
    const byRole = await Admin.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    console.log('BY_ROLE=' + JSON.stringify(byRole));
    await mongoose.disconnect();
  } catch (e) {
    console.error('ERR=' + e.message);
    process.exit(1);
  }
})();
