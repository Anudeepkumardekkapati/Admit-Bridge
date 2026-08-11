const ConsultantProfile = require("../models/ConsultantProfile");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

// @desc    Get consultant profile and assigned students
// @route   GET /api/consultant/dashboard
// @access  Private (Consultant, Admin)
exports.getConsultantDashboard = async (req, res) => {
  try {
    const profile = await ConsultantProfile.findOne({ user: req.user._id })
      .populate("assignedStudents", "name email");
      
    if (!profile) {
      return res.status(404).json({ message: "Consultant profile not found" });
    }
    
    // Get profiles for assigned students
    const studentProfiles = await StudentProfile.find({
      user: { $in: profile.assignedStudents.map(s => s._id) }
    }).populate("user", "name email");

    res.json({
      profile,
      assignedStudentProfiles: studentProfiles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
