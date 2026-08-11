const StudentProfile = require("../models/StudentProfile");
const Prediction = require("../models/Prediction");
const Application = require("../models/Application");
const University = require("../models/University");

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
exports.getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private (Student)
exports.updateStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get student applications
// @route   GET /api/student/applications
// @access  Private (Student)
exports.getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("university")
      .sort({ submittedDate: -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Apply for a college
// @route   POST /api/student/applications
// @access  Private (Student)
exports.createApplication = async (req, res) => {
  try {
    const { universityId, course, notes } = req.body;
    if (!universityId || !course) {
      return res
        .status(400)
        .json({ message: "universityId and course are required" });
    }

    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    // Prevent the same student from applying to the same college/course twice
    const existing = await Application.findOne({
      student: req.user._id,
      university: universityId,
      course: course.trim(),
    });
    if (existing) {
      return res.status(400).json({
        message: "You have already applied to this college for this course",
      });
    }

    const application = await Application.create({
      student: req.user._id,
      university: university._id,
      course: course.trim(),
      status: "Applied",
      submittedDate: new Date(),
      studentName: req.user.name,
      studentEmail: req.user.email,
      universityName: university.name,
      country: university.country,
      notes: notes || undefined,
    });

    const populated = await application.populate("university");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
