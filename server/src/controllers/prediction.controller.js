const Prediction = require("../models/Prediction");
const University = require("../models/University");
const StudentProfile = require("../models/StudentProfile");

// Mock AI logic for prediction
const calculateProbability = (studentProfile, university) => {
  // Simple heuristic for demo purposes
  const greDiff = studentProfile.greScore - university.avgGre;
  const cgpaDiff = studentProfile.cgpa - university.avgCgpa;
  
  let baseProbability = university.acceptanceRate + (greDiff * 2) + (cgpaDiff * 10);
  
  // Clamp between 5 and 95
  baseProbability = Math.max(5, Math.min(95, baseProbability));
  
  return Math.round(baseProbability);
};

const categorizeProbability = (prob) => {
  if (prob >= 70) return "Safe";
  if (prob >= 40) return "Target";
  return "Ambitious";
};

// @desc    Generate predictions for a student
// @route   POST /api/prediction/generate
// @access  Private (Student)
exports.generatePredictions = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({ message: "Please complete your profile first" });
    }

    const universities = await University.find();
    
    // Clear old predictions
    await Prediction.deleteMany({ student: req.user._id });

    const newPredictions = universities.map((uni) => {
      const prob = calculateProbability(studentProfile, uni);
      return {
        student: req.user._id,
        university: uni._id,
        probabilityScore: prob,
        category: categorizeProbability(prob),
        featuresUsed: {
          greScore: studentProfile.greScore,
          cgpa: studentProfile.cgpa,
          researchExperience: studentProfile.researchExperience
        }
      };
    });

    const savedPredictions = await Prediction.insertMany(newPredictions);
    
    // Return populated predictions
    const populatedPredictions = await Prediction.find({ student: req.user._id }).populate("university");
    
    res.json(populatedPredictions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get student predictions
// @route   GET /api/prediction
// @access  Private (Student)
exports.getPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ student: req.user._id }).populate("university");
    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
