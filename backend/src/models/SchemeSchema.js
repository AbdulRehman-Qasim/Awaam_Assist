const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    schemeId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    schemeName: {
        type: String,
        required: true,
        index: true
    },
    shortName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    subCategory: {
        type: String
    },
    department: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true,
        index: true
    },
    cities: [{
        type: String
    }],

    // Benefits
    benefits: {
        financial: {
            amount: {
                type: Number,
                required: true
            },
            frequency: {
                type: String,
                required: true
            },
            currency: {
                type: String,
                default: 'PKR'
            }
        },
        nonFinancial: [{
            type: String
        }],
        duration: {
            type: String
        }
    },

    // Eligibility Criteria
    eligibility: {
        income: {
            min: {
                type: Number,
                default: 0
            },
            max: {
                type: Number,
                required: true
            }
        },
        age: {
            min: {
                type: Number,
                default: 0
            },
            max: {
                type: Number,
                default: 100
            }
        },
        categories: [{
            type: String
        }],
        employmentStatus: [{
            type: String
        }],
        educationLevel: [{
            type: String
        }],
        familySize: {
            min: Number,
            max: Number
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Any', null]
        },
        specialConditions: [{
            type: String
        }]
    },

    // Application Process
    application: {
        method: {
            type: String,
            required: true
        },
        website: {
            type: String,
            required: true
        },
        steps: [{
            type: String
        }],
        requiredDocuments: [{
            type: String
        }],
        processingTime: {
            type: String
        },
        deadline: {
            type: Date
        },
        isOpen: {
            type: Boolean,
            default: true
        }
    },

    // Contact Information
    contact: {
        helpline: [{
            type: String
        }],
        email: [{
            type: String
        }],
        offices: [{
            city: String,
            address: String,
            phone: String
        }],
        website: {
            type: String
        },
        socialMedia: {
            facebook: String,
            twitter: String
        }
    },

    // Metadata
    launchDate: {
        type: Date
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Closed'],
        default: 'Active',
        index: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    description: {
        type: String,
        required: true
    },
    longDescription: {
        type: String
    },

    // FAQs
    faqs: [{
        question: String,
        answer: String
    }],

    // Related Schemes
    relatedSchemes: [{
        type: String
    }],

    // Statistics
    stats: {
        beneficiaries: {
            type: Number,
            default: 0
        },
        budgetAllocated: {
            type: Number,
            default: 0
        },
        applicationsReceived: {
            type: Number,
            default: 0
        }
    },
    createdByHospitalAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdmin',
        default: null
    }
}, {
    timestamps: true
});

// Text index for search functionality
SchemeSchema.index({ schemeName: 'text', description: 'text', department: 'text' });

// Compound indexes for common queries
SchemeSchema.index({ category: 1, province: 1 });
SchemeSchema.index({ status: 1, category: 1 });
SchemeSchema.index({ 'benefits.financial.amount': -1 });
SchemeSchema.index({ 'eligibility.income.max': 1, 'eligibility.age.max': 1 });

// Virtual for checking if scheme is currently accepting applications
SchemeSchema.virtual('isAcceptingApplications').get(function () {
    if (!this.application.isOpen) return false;
    if (!this.application.deadline) return true;
    return new Date() < this.application.deadline;
});

// Method to check eligibility
SchemeSchema.methods.checkEligibility = function (userProfile) {
    let score = 0;
    let maxScore = 0;
    const reasons = [];

    // Income check (20 points)
    if (this.eligibility.income) {
        maxScore += 20;
        if (
            userProfile.income >= this.eligibility.income.min &&
            userProfile.income <= this.eligibility.income.max
        ) {
            score += 20;
        } else {
            reasons.push(`Income must be between PKR ${this.eligibility.income.min.toLocaleString()} and PKR ${this.eligibility.income.max.toLocaleString()}`);
        }
    }

    // Age check (20 points)
    if (this.eligibility.age) {
        maxScore += 20;
        if (
            userProfile.age >= this.eligibility.age.min &&
            userProfile.age <= this.eligibility.age.max
        ) {
            score += 20;
        } else {
            reasons.push(`Age must be between ${this.eligibility.age.min} and ${this.eligibility.age.max} years`);
        }
    }

    // Province check (15 points)
    if (this.province !== 'Federal') {
        maxScore += 15;
        if (userProfile.province === this.province) {
            score += 15;
        } else {
            reasons.push(`Only available in ${this.province}`);
        }
    } else {
        maxScore += 15;
        score += 15; // Federal schemes available everywhere
    }

    // Category check (25 points)
    if (this.eligibility.categories && this.eligibility.categories.length > 0) {
        maxScore += 25;
        if (this.eligibility.categories.includes(userProfile.category)) {
            score += 25;
        } else {
            reasons.push(`Category must be one of: ${this.eligibility.categories.join(', ')}`);
        }
    }

    // Employment status check (20 points)
    if (this.eligibility.employmentStatus && this.eligibility.employmentStatus.length > 0) {
        maxScore += 20;
        if (
            this.eligibility.employmentStatus.includes(userProfile.employmentStatus) ||
            this.eligibility.employmentStatus.includes('Any')
        ) {
            score += 20;
        } else {
            reasons.push(`Employment status must be: ${this.eligibility.employmentStatus.join(' or ')}`);
        }
    }

    const eligibilityPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const isEligible = eligibilityPercentage >= 70; // 70% threshold

    return {
        isEligible,
        eligibilityPercentage,
        reasons: isEligible ? [] : reasons
    };
};

// Ensure virtuals are included in JSON
SchemeSchema.set('toJSON', { virtuals: true });
SchemeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Scheme', SchemeSchema);
