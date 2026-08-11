const ConsultantProfile = require("../models/ConsultantProfile");
const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const User = require("../models/User");

const APPLICATION_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Accepted",
  "Rejected",
  "Waitlisted",
];

// @desc    Get consultant profile, assigned students, and their applications
// @route   GET /api/consultant/dashboard
// @access  Private (Consultant, Admin)
exports.getConsultantDashboard = async (req, res) => {
  try {
    const profile = await ConsultantProfile.findOne({ user: req.user._id })
      .populate("assignedStudents", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Consultant profile not found" });
    }

    const assignedStudentIds = profile.assignedStudents.map((s) => s._id);

    // Get profiles for assigned students
    const studentProfiles = await StudentProfile.find({
      user: { $in: assignedStudentIds },
    }).populate("user", "name email");

    // Real applications submitted by students (of the assigned students)
    const applications = await Application.find({
      student: { $in: assignedStudentIds },
    })
      .populate("student", "name email")
      .populate("university")
      .sort({ submittedDate: -1 });

    // Attach each student's academic profile to their application
    const profileByUser = {};
    studentProfiles.forEach((p) => {
      profileByUser[p.user._id.toString()] = p;
    });
    const applicationsWithProfile = applications.map((app) => {
      const appObj = app.toObject();
      appObj.studentProfile = profileByUser[app.student._id.toString()] || null;
      return appObj;
    });

    res.json({
      profile,
      assignedStudentProfiles: studentProfiles,
      applications: applicationsWithProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an application's status
// @route   PATCH /api/consultant/applications/:id/status
// @access  Private (Consultant, Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(", ")}`,
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    const populated = await application.populate([
      { path: "student", select: "name email" },
      { path: "university" },
    ]);
    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
