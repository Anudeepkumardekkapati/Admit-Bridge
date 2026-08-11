const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Applied",
        "Under Review",
        "Shortlisted",
        "Accepted",
        "Rejected",
        "Waitlisted",
      ],
      default: "Applied",
    },
    submittedDate: {
      type: Date,
      default: Date.now,
    },
    // Snapshots so the application keeps the student/college info as of apply time
    studentName: {
      type: String,
      trim: true,
    },
    studentEmail: {
      type: String,
      trim: true,
    },
    universityName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent the same student from applying to the same college/course twice
applicationSchema.index(
  { student: 1, university: 1, course: 1 },
  { unique: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
