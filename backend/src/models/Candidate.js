// const mongoose = require('mongoose');

// const candidateSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     index: true // Non-unique index
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   jobApplied: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Job',
//     required: true
//   },
//   company: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Company',
//     required: true,
//     index: true // Non-unique index
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   status: {
//     type: String,
//     enum: ['Scheduled', 'Completed', 'Expired', 'Pending'],
//     default: 'Scheduled'
//   },
//   interview_id: { type: String, unique: true },  // must be unique
//   password: String,
//   score: {
//     type: Number,
//     default: null
//   }
// });

// // Drop all existing indexes
// candidateSchema.index({ name: 1 }, { unique: false });
// candidateSchema.index({ email: 1 }, { unique: false });
// candidateSchema.index({ jobApplied: 1 }, { unique: false });
// candidateSchema.index({ company: 1 }, { unique: false });

// // Create a compound index for email and jobApplied to prevent duplicates for the same job
// candidateSchema.index({ email: 1, jobApplied: 1 }, { unique: true });

// // Drop existing indexes when model is initialized
// candidateSchema.pre('save', async function(next) {
//   try {
//     await this.collection.dropIndexes();
//   } catch (error) {
//     // Ignore error if indexes don't exist
//     if (error.code !== 26) {
//       console.error('Error dropping indexes:', error);
//     }
//   }
//   next();
// });

// module.exports = mongoose.model('Candidate', candidateSchema);



const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // index: true ❌ REMOVE THIS
  },
  email: {
    type: String,
    required: true
  },
  jobApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    // index: true ❌ REMOVE THIS
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Expired', 'Pending'],
    default: 'Scheduled'
  },
  interview_id: { type: String, unique: true },
  password: String,
  score: {
    type: Number,
    default: null
  }
});

// ✅ Keep these manual indexes
candidateSchema.index({ name: 1 }, { unique: false });
candidateSchema.index({ email: 1 }, { unique: false });
candidateSchema.index({ jobApplied: 1 }, { unique: false });
candidateSchema.index({ company: 1 }, { unique: false });
candidateSchema.index({ email: 1, jobApplied: 1 }, { unique: true });

// ❌ Drop all indexes on every save — this is dangerous in production and not needed
// candidateSchema.pre('save', async function(next) { ... }) ❌ REMOVE THIS

module.exports = mongoose.model('Candidate', candidateSchema);
