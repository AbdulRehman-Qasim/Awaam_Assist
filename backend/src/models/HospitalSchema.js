const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    SerialNum: {
        type: Number
    },
    City: {
        type: String,
        required: true
    },
    Tehsil: {
        type: String,
        required: true
    },
    "Hospital Name": {
        type: String,
        required: true
    },
    Cateogry: {
        type: String,
        required: true
    },
    treatmentCost: {
        type: Number,
        default: 0
    },
    availability: {
        type: String,
        default: 'Available'
    },
    info: {
        type: String,
        default: ''
    },
    status: {
        type: mongoose.Schema.Types.Mixed,
        default: 'approved',
        index: true
    },
    website: {
        type: String,
        trim: true,
        default: ''
    },
    createdByHospitalAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdmin',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hospital', HospitalSchema);
