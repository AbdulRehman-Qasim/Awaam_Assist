// Sample Government Schemes Data
// This will be replaced with API calls to backend

export interface Scheme {
    schemeId: string;
    schemeName: string;
    shortName: string;
    category: string;
    subCategory: string;
    department: string;
    province: string;
    cities: string[];

    benefits: {
        financial: {
            amount: number;
            frequency: string;
            currency: string;
        };
        nonFinancial: string[];
        duration: string;
    };

    eligibility: {
        income: {
            min: number;
            max: number;
        };
        age: {
            min: number;
            max: number;
        };
        categories: string[];
        employmentStatus: string[];
        educationLevel?: string[];
        familySize?: {
            min: number;
            max: number;
        };
        gender?: string;
        specialConditions?: string[];
    };

    application: {
        method: string;
        website: string;
        steps: string[];
        requiredDocuments: string[];
        processingTime: string;
        deadline?: string;
        isOpen: boolean;
    };

    contact: {
        helpline: string[];
        email: string[];
        offices: Array<{
            city: string;
            address: string;
            phone: string;
        }>;
        website: string;
        socialMedia?: {
            facebook?: string;
            twitter?: string;
        };
    };

    launchDate: string;
    lastUpdated: string;
    status: string;
    description: string;
    longDescription: string;
    faqs?: Array<{
        question: string;
        answer: string;
    }>;
    relatedSchemes?: string[];

    stats?: {
        beneficiaries: number;
        budgetAllocated: number;
        applicationsReceived: number;
    };
}

export const sampleSchemes: Scheme[] = [
    {
        schemeId: "PKS001",
        schemeName: "Ehsaas Emergency Cash Program",
        shortName: "Ehsaas Cash",
        category: "Financial Assistance",
        subCategory: "Emergency Relief",
        department: "Ehsaas Program - Government of Pakistan",
        province: "Federal",
        cities: [],

        benefits: {
            financial: {
                amount: 12000,
                frequency: "One-time",
                currency: "PKR"
            },
            nonFinancial: [],
            duration: "One-time payment"
        },

        eligibility: {
            income: { min: 0, max: 30000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Daily Wage Worker", "Unemployed"],
            employmentStatus: ["Unemployed", "Self-Employed", "Daily Wage Worker"],
            familySize: { min: 1, max: 20 }
        },

        application: {
            method: "SMS & Online",
            website: "https://ehsaas.gov.pk",
            steps: [
                "Send your CNIC to 8171",
                "Wait for verification SMS",
                "Collect cash from designated Ehsaas center with CNIC"
            ],
            requiredDocuments: ["CNIC (Original)"],
            processingTime: "3-5 days",
            isOpen: true
        },

        contact: {
            helpline: ["051-9245100", "8171"],
            email: ["info@ehsaas.gov.pk"],
            offices: [
                {
                    city: "Islamabad",
                    address: "Ehsaas Program, PM Office, Constitution Avenue",
                    phone: "051-9245100"
                }
            ],
            website: "https://ehsaas.gov.pk"
        },

        launchDate: "2020-03-31",
        lastUpdated: "2024-01-15",
        status: "Active",
        description: "Emergency cash assistance for low-income families affected by economic hardship",
        longDescription: "The Ehsaas Emergency Cash Program provides immediate financial relief to vulnerable families across Pakistan. This initiative aims to support those facing economic difficulties by providing direct cash transfers.",

        faqs: [
            {
                question: "Who is eligible for Ehsaas Emergency Cash?",
                answer: "Families earning less than PKR 30,000 per month are eligible. You must have a valid CNIC."
            },
            {
                question: "How do I apply?",
                answer: "Send your CNIC number to 8171 via SMS. You will receive a confirmation message if eligible."
            }
        ],

        stats: {
            beneficiaries: 12000000,
            budgetAllocated: 144000000000,
            applicationsReceived: 15000000
        }
    },

    {
        schemeId: "PKS002",
        schemeName: "Prime Minister Youth Business Loan",
        shortName: "PM Youth Loan",
        category: "Financial Assistance",
        subCategory: "Business Development",
        department: "Prime Minister's Youth Program",
        province: "Federal",
        cities: [],

        benefits: {
            financial: {
                amount: 500000,
                frequency: "One-time Loan",
                currency: "PKR"
            },
            nonFinancial: ["Business Training", "Mentorship Program", "Marketing Support"],
            duration: "Loan repayment over 5 years"
        },

        eligibility: {
            income: { min: 0, max: 100000 },
            age: { min: 21, max: 45 },
            categories: ["Youth", "Entrepreneur", "Business Owner"],
            employmentStatus: ["Self-Employed", "Unemployed", "Student"],
            educationLevel: ["Intermediate", "Bachelor's", "Master's", "Diploma"]
        },

        application: {
            method: "Online",
            website: "https://pmyouthprogram.gov.pk",
            steps: [
                "Register on PM Youth Program portal",
                "Submit business plan and required documents",
                "Attend business training session",
                "Wait for loan approval",
                "Sign loan agreement and receive funds"
            ],
            requiredDocuments: [
                "CNIC",
                "Educational Certificates",
                "Business Plan (detailed)",
                "Bank Statements (last 6 months)",
                "Guarantor Documents"
            ],
            processingTime: "30-45 days",
            isOpen: true
        },

        contact: {
            helpline: ["051-111-989-989"],
            email: ["info@pmyouthprogram.gov.pk"],
            offices: [
                {
                    city: "Islamabad",
                    address: "PM Youth Program Office, G-5/2",
                    phone: "051-111-989-989"
                },
                {
                    city: "Lahore",
                    address: "PM Youth Program Office, Gulberg III",
                    phone: "042-111-989-989"
                }
            ],
            website: "https://pmyouthprogram.gov.pk"
        },

        launchDate: "2013-11-01",
        lastUpdated: "2024-01-10",
        status: "Active",
        description: "Interest-free business loans for young entrepreneurs to start or expand their businesses",
        longDescription: "The PM Youth Business Loan Scheme provides financial support to young entrepreneurs aged 21-45 years. The program offers loans up to PKR 500,000 with easy repayment terms and includes business training and mentorship.",

        stats: {
            beneficiaries: 50000,
            budgetAllocated: 25000000000,
            applicationsReceived: 150000
        }
    },

    {
        schemeId: "PKS003",
        schemeName: "Sehat Sahulat Card Program",
        shortName: "Sehat Card",
        category: "Healthcare",
        subCategory: "Medical Insurance",
        department: "Ministry of Health - Government of Pakistan",
        province: "Federal",
        cities: [],

        benefits: {
            financial: {
                amount: 1000000,
                frequency: "Annual Coverage",
                currency: "PKR"
            },
            nonFinancial: [
                "Free hospitalization",
                "Free surgeries",
                "Free medicines during treatment",
                "Free diagnostic tests"
            ],
            duration: "Annual renewal"
        },

        eligibility: {
            income: { min: 0, max: 50000 },
            age: { min: 0, max: 100 },
            categories: ["Low Income Family"],
            employmentStatus: ["Any"],
            familySize: { min: 1, max: 20 }
        },

        application: {
            method: "Automatic Registration",
            website: "https://pmhealthprogram.gov.pk",
            steps: [
                "Check eligibility via SMS (8500)",
                "Collect card from designated center with CNIC",
                "Use card at empaneled hospitals"
            ],
            requiredDocuments: ["CNIC", "Family Registration Certificate"],
            processingTime: "Immediate (if eligible)",
            isOpen: true
        },

        contact: {
            helpline: ["051-9245300", "8500"],
            email: ["info@pmhealthprogram.gov.pk"],
            offices: [
                {
                    city: "Islamabad",
                    address: "PM Health Program, Ministry of Health",
                    phone: "051-9245300"
                }
            ],
            website: "https://pmhealthprogram.gov.pk"
        },

        launchDate: "2015-12-31",
        lastUpdated: "2024-01-20",
        status: "Active",
        description: "Free medical treatment coverage up to PKR 1 million annually for low-income families",
        longDescription: "The Sehat Sahulat Card provides comprehensive health insurance coverage to low-income families across Pakistan. Cardholders can access free medical treatment at empaneled hospitals nationwide.",

        faqs: [
            {
                question: "What medical services are covered?",
                answer: "All indoor treatments, surgeries, medicines during hospitalization, and diagnostic tests are covered up to PKR 1 million per year."
            },
            {
                question: "Which hospitals accept Sehat Card?",
                answer: "Over 700 hospitals across Pakistan are empaneled. Check the website for the complete list."
            }
        ],

        stats: {
            beneficiaries: 8000000,
            budgetAllocated: 400000000000,
            applicationsReceived: 10000000
        }
    },

    {
        schemeId: "PKS004",
        schemeName: "Benazir Income Support Programme",
        shortName: "BISP",
        category: "Financial Assistance",
        subCategory: "Social Safety Net",
        department: "Benazir Income Support Programme",
        province: "Federal",
        cities: [],

        benefits: {
            financial: {
                amount: 9000,
                frequency: "Quarterly",
                currency: "PKR"
            },
            nonFinancial: ["Educational Scholarships for Children"],
            duration: "Ongoing (as long as eligible)"
        },

        eligibility: {
            income: { min: 0, max: 25000 },
            age: { min: 18, max: 100 },
            categories: ["Low Income Family", "Woman"],
            employmentStatus: ["Any"],
            gender: "Female",
            familySize: { min: 1, max: 20 }
        },

        application: {
            method: "Survey-based & Online",
            website: "https://bisp.gov.pk",
            steps: [
                "Wait for BISP survey team visit",
                "Provide accurate information during survey",
                "Check eligibility status online with CNIC",
                "Collect payment from designated bank/ATM"
            ],
            requiredDocuments: ["CNIC", "Utility Bills", "Family Information"],
            processingTime: "Survey-dependent",
            isOpen: true
        },

        contact: {
            helpline: ["051-9246700"],
            email: ["complaints@bisp.gov.pk"],
            offices: [
                {
                    city: "Islamabad",
                    address: "BISP Headquarters, Plot 5-C, G-5/2",
                    phone: "051-9246700"
                }
            ],
            website: "https://bisp.gov.pk"
        },

        launchDate: "2008-07-01",
        lastUpdated: "2024-01-18",
        status: "Active",
        description: "Quarterly cash assistance for poor women to support their families",
        longDescription: "BISP provides unconditional cash transfers to poor women across Pakistan. The program aims to reduce poverty and empower women by providing them with financial resources.",

        stats: {
            beneficiaries: 9000000,
            budgetAllocated: 400000000000,
            applicationsReceived: 12000000
        }
    },

    {
        schemeId: "PKS005",
        schemeName: "Kamyab Pakistan Program - Kamyab Karobar",
        shortName: "Kamyab Karobar",
        category: "Financial Assistance",
        subCategory: "Business Loans",
        department: "State Bank of Pakistan",
        province: "Federal",
        cities: [],

        benefits: {
            financial: {
                amount: 10000000,
                frequency: "One-time Loan",
                currency: "PKR"
            },
            nonFinancial: ["Business Advisory Services"],
            duration: "Loan repayment up to 8 years"
        },

        eligibility: {
            income: { min: 0, max: 300000 },
            age: { min: 21, max: 60 },
            categories: ["Business Owner", "Entrepreneur", "Farmer"],
            employmentStatus: ["Self-Employed", "Business Owner"]
        },

        application: {
            method: "Through Participating Banks",
            website: "https://kamyabpakistan.gov.pk",
            steps: [
                "Visit participating bank branch",
                "Submit loan application with business plan",
                "Provide required documents",
                "Bank evaluation and approval",
                "Loan disbursement"
            ],
            requiredDocuments: [
                "CNIC",
                "Business Registration",
                "Business Plan",
                "Financial Statements",
                "Collateral Documents"
            ],
            processingTime: "45-60 days",
            isOpen: true
        },

        contact: {
            helpline: ["021-111-727-273"],
            email: ["info@kamyabpakistan.gov.pk"],
            offices: [
                {
                    city: "Karachi",
                    address: "State Bank of Pakistan, I.I. Chundrigar Road",
                    phone: "021-111-727-273"
                }
            ],
            website: "https://kamyabpakistan.gov.pk"
        },

        launchDate: "2021-10-01",
        lastUpdated: "2024-01-12",
        status: "Active",
        description: "Low-cost business loans for small and medium enterprises",
        longDescription: "Kamyab Karobar provides affordable financing to existing businesses and new entrepreneurs. The program offers loans up to PKR 10 million with subsidized markup rates.",

        stats: {
            beneficiaries: 25000,
            budgetAllocated: 50000000000,
            applicationsReceived: 75000
        }
    }
];

// ── INTELLIGENT ELIGIBILITY ENGINE ───────────────────────────────────────────
export const checkSchemeEligibility = (
    scheme: Scheme,
    userProfile: {
        income: number;
        age: number;
        province: string;
        city: string;
        category: string;
        employmentStatus: string;
        familySize?: number;
        gender?: string;
        educationLevel?: string;
    }
): { isEligible: boolean; eligibilityPercentage: number; reasons: string[] } => {
    const reasons: string[] = [];

    // ── HARD FAILS (any failure = instantly ineligible) ──────────────────────

    // 1. Income — must be within range
    if (scheme.eligibility.income) {
        const { min, max } = scheme.eligibility.income;
        if (userProfile.income < min || userProfile.income > max) {
            reasons.push(`Income must be between PKR ${min.toLocaleString()} and PKR ${max.toLocaleString()}`);
            return { isEligible: false, eligibilityPercentage: 0, reasons };
        }
    }

    // 2. Age — must be within range
    if (scheme.eligibility.age) {
        const { min, max } = scheme.eligibility.age;
        if (userProfile.age < min || userProfile.age > max) {
            reasons.push(`Age must be between ${min} and ${max} years`);
            return { isEligible: false, eligibilityPercentage: 0, reasons };
        }
    }

    // 3. Gender — scheme-specified gender requirement (hard fail)
    if (scheme.eligibility.gender && userProfile.gender) {
        if (
            scheme.eligibility.gender !== "Any" &&
            scheme.eligibility.gender.toLowerCase() !== userProfile.gender.toLowerCase()
        ) {
            reasons.push(`This scheme is only for ${scheme.eligibility.gender}`);
            return { isEligible: false, eligibilityPercentage: 0, reasons };
        }
    }

    // 4. Province — non-Federal schemes are restricted (hard fail)
    if (scheme.province !== "Federal" && userProfile.province !== "Federal") {
        if (scheme.province !== userProfile.province) {
            reasons.push(`Only available in ${scheme.province}`);
            return { isEligible: false, eligibilityPercentage: 0, reasons };
        }
    }

    // ── SOFT SCORING (optional criteria — raise relevance score) ─────────────
    let softScore = 0;
    let softMax = 0;

    // 5. Eligibility categories — user demographic category (Farmer, Student, etc.)
    //    "Any" user category = wildcard (matches all schemes)
    if (scheme.eligibility.categories && scheme.eligibility.categories.length > 0) {
        softMax += 40;
        if (
            userProfile.category === "Any" ||
            scheme.eligibility.categories.includes(userProfile.category) ||
            scheme.eligibility.categories.includes("Any")
        ) {
            softScore += 40;
        } else {
            // Partial credit: check for semantic overlap
            const lowerUserCat = userProfile.category.toLowerCase();
            const hasPartialMatch = scheme.eligibility.categories.some(
                (c) => c.toLowerCase().includes(lowerUserCat) || lowerUserCat.includes(c.toLowerCase())
            );
            if (hasPartialMatch) softScore += 20;
            else reasons.push(`Prefer: ${scheme.eligibility.categories.join(", ")}`);
        }
    }

    // 6. Employment status
    if (scheme.eligibility.employmentStatus && scheme.eligibility.employmentStatus.length > 0) {
        softMax += 30;
        if (
            userProfile.employmentStatus === "Any" ||
            scheme.eligibility.employmentStatus.includes("Any") ||
            scheme.eligibility.employmentStatus.includes(userProfile.employmentStatus)
        ) {
            softScore += 30;
        } else {
            reasons.push(`Preferred employment: ${scheme.eligibility.employmentStatus.join(" or ")}`);
        }
    }

    // 7. Education level (optional)
    if (scheme.eligibility.educationLevel && scheme.eligibility.educationLevel.length > 0 && userProfile.educationLevel) {
        softMax += 15;
        if (scheme.eligibility.educationLevel.includes(userProfile.educationLevel)) {
            softScore += 15;
        }
    }

    // 8. Family size (optional)
    if (scheme.eligibility.familySize && userProfile.familySize != null) {
        softMax += 15;
        const { min, max } = scheme.eligibility.familySize;
        if (userProfile.familySize >= min && userProfile.familySize <= max) {
            softScore += 15;
        }
    }

    // ── CALCULATE FINAL SCORE ─────────────────────────────────────────────────
    // Hard criteria already passed. Soft score determines relevance.
    // If no soft criteria exist, scheme is 100% eligible (it only had hard checks).
    const eligibilityPercentage = softMax > 0
        ? Math.round((softScore / softMax) * 100)
        : 100;

    // Threshold: must score at least 40% on soft criteria to be shown
    // (This allows schemes with "Any" employment/category to always appear)
    const isEligible = softMax === 0 || eligibilityPercentage >= 40;

    return {
        isEligible,
        eligibilityPercentage,
        reasons: isEligible ? [] : reasons,
    };
};


// Get unique categories
export const getSchemeCategories = (): string[] => {
    return [...new Set(sampleSchemes.map((s) => s.category))];
};

// Get unique provinces
export const getSchemeProvinces = (): string[] => {
    const provinces = [...new Set(sampleSchemes.map((s) => s.province))];
    return provinces.filter((p) => p !== "Federal").concat(["Federal"]);
};
