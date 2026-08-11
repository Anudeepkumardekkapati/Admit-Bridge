const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    greScore: {
      type: Number,
      min: 260,
      max: 340,
    },
    toeflScore: {
      type: Number,
      min: 0,
      max: 120,
    },
    ieltsScore: {
      type: Number,
      min: 0,
      max: 9,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10, // Assuming 10-point scale
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    preferredCountry: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      min: 0, // USD per year
    },
    researchExperience: {
      type: Number,
      default: 0, // Months of research
    },
    workExperience: {
      type: Number,
      default: 0, // Months of work ex
    },
    intendedMajor: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    bachelorDegree: {
      type: String,
      trim: true,
    },
    bachelorUniversity: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    targetTerm: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

module.exports = StudentProfile;
