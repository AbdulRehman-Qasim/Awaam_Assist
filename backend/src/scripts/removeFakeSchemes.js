require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/SchemeSchema');

const removeFakeSchemes = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');

        console.log('✅ Connected to MongoDB');
        console.log('\n📊 Current database status:');
        const currentCount = await Scheme.countDocuments();
        console.log(`   Total schemes: ${currentCount}`);

        // Find all fake schemes (PKS052-PKS100) that have numbers in their names
        const fakeSchemes = await Scheme.find({
            $or: [
                { schemeName: { $regex: /Scheme \d+$/ } }, // Matches "Scheme 52", "Scheme 53", etc.
                {
                    schemeId: {
                        $gte: 'PKS052',
                        $lte: 'PKS100'
                    },
                    schemeName: { $regex: /\d+$/ } // Ends with numbers
                }
            ]
        }).sort('schemeId');

        console.log(`\n🔍 Found ${fakeSchemes.length} fake schemes to remove:`);
        fakeSchemes.forEach(s => {
            console.log(`   - ${s.schemeId}: ${s.schemeName}`);
        });

        if (fakeSchemes.length === 0) {
            console.log('\n✅ No fake schemes found! Database is clean.');
            process.exit(0);
        }

        console.log('\n🗑️  Removing fake schemes...');
        const result = await Scheme.deleteMany({
            _id: { $in: fakeSchemes.map(s => s._id) }
        });

        const finalCount = await Scheme.countDocuments();

        console.log('\n' + '='.repeat(80));
        console.log('📊 CLEANUP SUMMARY:');
        console.log('='.repeat(80));
        console.log(`🗑️  Removed: ${result.deletedCount} fake schemes`);
        console.log(`📈 Previous count: ${currentCount}`);
        console.log(`📊 Final count: ${finalCount}`);
        console.log(`✅ Remaining: ${finalCount} verified official schemes`);
        console.log('='.repeat(80));

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log('✨ All fake numbered schemes have been removed.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

removeFakeSchemes();
