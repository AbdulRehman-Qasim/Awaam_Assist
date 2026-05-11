const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true,
        index: true
    },
    discipline: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    merit: {
        type: Number,
        required: true
    },
    fee: {
        type: Number
    },
    semesterFee: {
        type: Number
    },
    feeType: {
        type: String,
        enum: ['Annual Fee', 'Semester Fee'],
        default: 'Annual Fee'
    },
    description: {
        type: String
    },
    deadline: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    }
}, {
    timestamps: true
});

ProgramSchema.pre('validate', function (next) {
    const hasAnnualFee = typeof this.fee === 'number' && this.fee > 0;
    const hasSemesterFee = typeof this.semesterFee === 'number' && this.semesterFee > 0;

    if (hasAnnualFee && hasSemesterFee) {
        return next(new Error('Provide either annual fee or semester fee, not both.'));
    }
    next();
});

module.exports = mongoose.model('Program', ProgramSchema);
