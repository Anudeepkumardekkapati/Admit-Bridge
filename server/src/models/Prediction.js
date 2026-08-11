const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
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
    probabilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      enum: ["Safe", "Target", "Ambitious"],
      required: true,
    },
    featuresUsed: {
      greScore: Number,
      cgpa: Number,
      researchExperience: Number,
    }
  },
  { timestamps: true }
);

const Prediction = mongoose.model("Prediction", predictionSchema);

module.exports = Prediction;
