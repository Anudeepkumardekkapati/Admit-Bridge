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
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Under Review", "Accepted", "Rejected", "Waitlisted"],
      default: "Draft",
    },
    submittedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
