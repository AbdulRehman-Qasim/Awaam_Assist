require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const University = require('../models/UniversitySchema');
const Program = require('../models/ProgramSchema');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const universities = await University.find({}).lean();
        console.log(`Found ${universities.length} total university records.`);

        const grouped = {};

        // Group by title and city (to find unique universities)
        for (const uni of universities) {
            const key = `${uni.title.trim().toLowerCase()}_${uni.city.trim().toLowerCase()}`;
            if (!grouped[key]) {
                grouped[key] = {
                    base: null,
                    programs: [],
                    allIds: []
                };
            }
            grouped[key].allIds.push(uni._id);
            
            if (uni.discipline && uni.discipline.toLowerCase() !== 'general' && uni.discipline.trim() !== '') {
                grouped[key].programs.push(uni);
            } else {
                if (!grouped[key].base) {
                    grouped[key].base = uni;
                }
            }
        }

        console.log(`Found ${Object.keys(grouped).length} unique universities.`);

        for (const key of Object.keys(grouped)) {
            const group = grouped[key];
            
            // Determine base university to keep
            let baseUni = group.base;
            if (!baseUni && group.programs.length > 0) {
                baseUni = group.programs[0]; // pick first as base
            }

            if (!baseUni) continue;

            // Update base university to active if it has programs
            const status = group.programs.length > 0 ? 'approved' : 'draft';

            // Create new base record or update existing
            await University.findByIdAndUpdate(baseUni._id, {
                status: status,
                $unset: {
                    discipline: "", degree: "", fee: "", semesterFee: "", feeType: "", merit: "", admission: "", admissions: "", deadline: ""
                }
            }, { strict: false });

            // Create programs
            for (const prog of group.programs) {
                const programData = {
                    universityId: baseUni._id,
                    discipline: prog.discipline,
                    degree: prog.degree || 'N/A',
                    merit: prog.merit || 0,
                    fee: prog.fee || 0,
                    semesterFee: prog.semesterFee || 0,
                    feeType: prog.feeType || 'Annual Fee',
                    description: prog.description || '',
                    status: 'active'
                };
                await Program.findOneAndUpdate(
                    { universityId: baseUni._id, discipline: prog.discipline, degree: prog.degree || 'N/A' },
                    programData,
                    { upsert: true, new: true }
                );
            }

            // Delete duplicate university records
            const idsToDelete = group.allIds.filter(id => id.toString() !== baseUni._id.toString());
            if (idsToDelete.length > 0) {
                await University.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`Deleted ${idsToDelete.length} duplicates for ${baseUni.title}`);
            }
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
