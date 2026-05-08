const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
    admissions: {
        type: String,
        default: "0.0"
    },
    city: {
        type: String,
        required: true
    },
    contact: {
        type: String
    },
    degree: {
        type: String,
        required: true
    },
    discipline: {
        type: String,
        required: true
    },
    fee: {
        type: Number
    },
    semesterFee: {
        type: Number
    },
    id: {
        type: String,
        required: true
    },
    info: {
        type: String
    },
    key: {
        type: Number
    },
    logo: {
        type: String
    },
    merit: {
        type: Number
    },
    province: {
        type: String,
        required: true
    },
    ranking: {
        type: Number
    },
    status: {
        type: mongoose.Schema.Types.Mixed,
        default: 'pending',
        index: true
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String
    },
    web: {
        type: String
    },
    deadline: {
        type: String
    },
    // v2 enriched fields
    feeType: {
        type: String,
        enum: ['Annual Fee', 'Semester Fee'],
        default: 'Annual Fee'
    },
    description: {
        type: String
    },
    admission: {
        type: String
    },
    map: {
        address: String,
        lat: Number,
        location: String,
        long: Number
    },
    createdByHospitalAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdmin',
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better performance
UniversitySchema.index({ city: 1 });
UniversitySchema.index({ province: 1 });
UniversitySchema.index({ discipline: 1 });
UniversitySchema.index({ degree: 1 });
UniversitySchema.index({ title: "text" });
UniversitySchema.index({ ranking: 1 });
UniversitySchema.index({ merit: -1 });
// Compound index for common queries
UniversitySchema.index({ ranking: 1, merit: -1 });
// Compound index for discipline queries
UniversitySchema.index({ discipline: 1, ranking: 1 });

UniversitySchema.pre('validate', function (next) {
    const hasAnnualFee   = typeof this.fee === 'number' && this.fee > 0;
    const hasSemesterFee = typeof this.semesterFee === 'number' && this.semesterFee > 0;

    if (hasAnnualFee && hasSemesterFee) {
        return next(new Error('Provide either annual fee or semester fee, not both.'));
    }
    // Allow null/zero fees for seeded records — admin form validates this client-side
    next();
});

module.exports = mongoose.model('University', UniversitySchema);
