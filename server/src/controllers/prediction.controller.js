const Prediction = require("../models/Prediction");
const University = require("../models/University");
const StudentProfile = require("../models/StudentProfile");
const config = require("../config/env");

// Local heuristic used as a fallback when the ML service is unreachable.
const calculateProbability = (studentProfile, university) => {
  const greDiff = (studentProfile.greScore || 0) - (university.avgGre || 0);
  const cgpaDiff = (studentProfile.cgpa || 0) - (university.avgCgpa || 0);

  let baseProbability =
    (university.acceptanceRate || 50) + greDiff * 2 + cgpaDiff * 10;

  baseProbability = Math.max(5, Math.min(95, baseProbability));

  return Math.round(baseProbability);
};

const categorizeProbability = (prob) => {
  if (prob >= 70) return "Safe";
  if (prob >= 40) return "Target";
  return "Ambitious";
};

// Build Prediction docs from a list of { university, probabilityScore, category, reason }.
const buildPredictionDocs = (userId, studentProfile, results) =>
  results.map((r) => ({
    student: userId,
    university: r.university,
    probabilityScore: r.probabilityScore,
    category: r.category,
    reason: r.reason,
    featuresUsed: {
      greScore: studentProfile.greScore,
      cgpa: studentProfile.cgpa,
      researchExperience: studentProfile.researchExperience,
    },
  }));

// Ask the ML service (ml/app.py) to score the universities. Throws on failure.
const callMLService = async (studentProfile, universities) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${config.mlServiceUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        student: {
          greScore: studentProfile.greScore,
          toeflScore: studentProfile.toeflScore,
          ieltsScore: studentProfile.ieltsScore,
          cgpa: studentProfile.cgpa,
          researchExperience: studentProfile.researchExperience,
          workExperience: studentProfile.workExperience,
          intendedMajor: studentProfile.intendedMajor,
          targetTerm: studentProfile.targetTerm,
          preferredCountry: studentProfile.preferredCountry,
          budget: studentProfile.budget,
        },
        universities: universities.map((u) => ({
          _id: u._id,
          name: u.name,
          country: u.country,
          worldRank: u.worldRank,
          avgGre: u.avgGre,
          avgToefl: u.avgToefl,
          ieltsRequirement: u.ieltsRequirement,
          avgCgpa: u.avgCgpa,
          acceptanceRate: u.acceptanceRate,
          tuitionFee: u.tuitionFee,
          programs: u.programs || [],
        })),
      }),
    });

    if (!res.ok) throw new Error(`ML service responded with ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.results)) throw new Error("Malformed ML response");
    return data.results;
  } finally {
    clearTimeout(timeout);
  }
};

// Local fallback: same shape as the ML service response.
const localFallback = (studentProfile, universities) =>
  universities
    .map((uni) => ({
      university: uni._id,
      probabilityScore: calculateProbability(studentProfile, uni),
      category: categorizeProbability(
        calculateProbability(studentProfile, uni)
      ),
      reason: "Rule-based estimate (ML service unavailable)",
    }))
    .sort((a, b) => b.probabilityScore - a.probabilityScore);

// @desc    Generate predictions for a student
// @route   POST /api/prediction/generate
// @access  Private (Student)
exports.generatePredictions = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res
        .status(400)
        .json({ message: "Please complete your profile first" });
    }

    const universities = await University.find();

    // Try the ML service; fall back to the local heuristic if unavailable.
    let results;
    let usedML = true;
    try {
      const mlResults = await callMLService(studentProfile, universities);
      results = mlResults.map((r) => ({
        university: r.universityId,
        probabilityScore: r.probabilityScore,
        category: r.category,
        reason: r.reason,
      }));
    } catch (error) {
      console.warn(
        `ML service unavailable (${error.message}), using local fallback`
      );
      usedML = false;
      results = localFallback(studentProfile, universities);
    }

    const docs = buildPredictionDocs(req.user._id, studentProfile, results);

    await Prediction.deleteMany({ student: req.user._id });
    await Prediction.insertMany(docs);

    const populatedPredictions = await Prediction.find({
      student: req.user._id,
    }).populate("university");

    res.json({
      usedML,
      predictions: populatedPredictions,
    });
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
    const predictions = await Prediction.find({ student: req.user._id }).populate(
      "university"
    );
    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
