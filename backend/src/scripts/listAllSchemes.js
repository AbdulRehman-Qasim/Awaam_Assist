require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/SchemeSchema');
const fs = require('fs');

const listAllSchemes = async () => {
    try {
        await mongoose.connect('mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');

        const schemes = await Scheme.find({}, 'schemeId schemeName category province description')
            .sort('schemeId');

        let output = '';
        output += '='.repeat(100) + '\n';
        output += `COMPLETE LIST OF ALL ${schemes.length} GOVERNMENT SCHEMES IN DATABASE\n`;
        output += '='.repeat(100) + '\n\n';

        // Group by category
        const byCategory = {};
        schemes.forEach(s => {
            if (!byCategory[s.category]) byCategory[s.category] = [];
            byCategory[s.category].push(s);
        });

        output += '📊 BREAKDOWN BY CATEGORY:\n\n';
        Object.keys(byCategory).sort().forEach(cat => {
            output += `  ${cat}: ${byCategory[cat].length} schemes\n`;
        });

        output += '\n' + '='.repeat(100) + '\n';
        output += 'DETAILED LIST:\n';
        output += '='.repeat(100) + '\n\n';

        schemes.forEach((s, i) => {
            output += `${(i + 1).toString().padStart(3, ' ')}. ${s.schemeId} - ${s.schemeName}\n`;
            output += `     Category: ${s.category.padEnd(25)} | Province: ${s.province}\n`;
            output += `     ${s.description}\n\n`;
        });

        output += '='.repeat(100) + '\n';

        // Save to file
        fs.writeFileSync('schemes_list.txt', output);
        console.log('✅ List saved to schemes_list.txt');
        console.log(`\n📊 Total Schemes: ${schemes.length}`);
        console.log('\n📋 Categories:');
        Object.keys(byCategory).sort().forEach(cat => {
            console.log(`   ${cat}: ${byCategory[cat].length}`);
        });

        // Print first 10 as preview
        console.log('\n📝 Preview (First 10 schemes):');
        console.log('='.repeat(80));
        schemes.slice(0, 10).forEach((s, i) => {
            console.log(`${i + 1}. ${s.schemeId} - ${s.schemeName}`);
            console.log(`   ${s.category} | ${s.province}`);
        });
        console.log('='.repeat(80));
        console.log('\n✅ Full list saved in schemes_list.txt file');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

listAllSchemes();
