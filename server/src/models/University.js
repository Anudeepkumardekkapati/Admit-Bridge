const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    worldRank: {
      type: Number,
    },
    avgGre: {
      type: Number,
    },
    avgToefl: {
      type: Number,
    },
    avgCgpa: {
      type: Number,
    },
    acceptanceRate: {
      type: Number, // Percentage 0-100
    },
    tuitionFee: {
      type: Number,
    },
    programs: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const University = mongoose.model("University", universitySchema);

module.exports = University;
