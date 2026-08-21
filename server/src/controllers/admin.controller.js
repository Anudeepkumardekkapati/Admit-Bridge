const User = require("../models/User");
const University = require("../models/University");
const StudentProfile = require("../models/StudentProfile");
const ConsultantProfile = require("../models/ConsultantProfile");
const Application = require("../models/Application");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all universities
// @route   GET /api/admin/universities
// @access  Private (Admin)
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find({});
    res.json(universities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Platform analytics for the admin dashboard (all real DB data)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const [users, universities, studentProfiles, consultantProfiles, applications] = await Promise.all([
      User.find({}).select("-password"),
      University.find({}),
      StudentProfile.find({}).populate("user", "name email"),
      ConsultantProfile.find({}).populate("user", "name email"),
      Application.find({})
        .populate("student", "name email")
        .populate("university"),
    ]);

    const students = users.filter((u) => u.role === "student");
    const consultants = users.filter((u) => u.role === "consultant");
    const admins = users.filter((u) => u.role === "admin");

    // Active users = logged in within the last 30 days (real lastLoginAt data)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(
      (u) => u.lastLoginAt && new Date(u.lastLoginAt) >= thirtyDaysAgo
    ).length;

    // ---- Application status statistics ----
    const statusCounts = {};
    applications.forEach((a) => {
      const s = a.status || "Unknown";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const applicationsByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    // ---- Applications by country ----
    const countryCounts = {};
    applications.forEach((a) => {
      const c = a.country || a.university?.country || "Unknown";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const applicationsByCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    // ---- Most applied colleges ----
    const collegeCounts = {};
    applications.forEach((a) => {
      const id = a.university?._id?.toString() || a.universityName || "Unknown";
      if (!collegeCounts[id]) {
        collegeCounts[id] = {
          university: a.university || { name: a.universityName || "Unknown", country: a.country },
          count: 0,
        };
      }
      collegeCounts[id].count += 1;
    });
    const mostAppliedColleges = Object.values(collegeCounts)
      .sort((a, b) => b.count - a.count);

    // ---- Popular courses ----
    const courseCounts = {};
    applications.forEach((a) => {
      const c = a.course || "Unknown";
      courseCounts[c] = (courseCounts[c] || 0) + 1;
    });
    const popularCourses = Object.entries(courseCounts)
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count);

    // ---- Student activity / performance ----
    const profileByUser = {};
    studentProfiles.forEach((p) => {
      if (p.user) profileByUser[p.user._id.toString()] = p;
    });
    const studentsData = students
      .map((s) => {
        const apps = applications.filter(
          (a) => a.student?._id?.toString() === s._id.toString()
        );
        return {
          user: {
            _id: s._id,
            name: s.name,
            email: s.email,
            createdAt: s.createdAt,
            lastLoginAt: s.lastLoginAt,
          },
          profile: profileByUser[s._id.toString()] || null,
          applicationCount: apps.length,
          applications: apps.map((a) => ({
            _id: a._id,
            universityName: a.universityName || a.university?.name,
            country: a.country || a.university?.country,
            course: a.course,
            status: a.status,
            submittedDate: a.submittedDate,
          })),
        };
      })
      .sort((a, b) => b.applicationCount - a.applicationCount);

    // ---- Consultant activity / performance ----
    const userById = {};
    users.forEach((u) => {
      userById[u._id.toString()] = u;
    });
    const consultantsData = consultants
      .map((c) => {
        const cp = consultantProfiles.find(
          (p) => p.user?._id?.toString() === c._id.toString()
        );
        const assignedIds = new Set(
          (cp?.assignedStudents || []).map((id) => id.toString())
        );
        const assignedApps = applications.filter(
          (a) => a.student && assignedIds.has(a.student._id.toString())
        );
        const latest = assignedApps.reduce(
          (mx, a) =>
            !mx || new Date(a.submittedDate) > new Date(mx)
              ? a.submittedDate
              : mx,
          null
        );
        return {
          user: {
            _id: c._id,
            name: c.name,
            email: c.email,
            createdAt: c.createdAt,
            lastLoginAt: c.lastLoginAt,
          },
          profile: cp
            ? { bio: cp.bio, expertise: cp.expertise || [] }
            : null,
          assignedStudents: (cp?.assignedStudents || [])
            .map((id) => {
              const u = userById[id.toString()];
              return u ? { _id: u._id, name: u.name, email: u.email } : null;
            })
            .filter(Boolean),
          assignedStudentCount: cp?.assignedStudents?.length || 0,
          applicationCount: assignedApps.length,
          lastApplicationDate: latest,
        };
      })
      .sort((a, b) => b.applicationCount - a.applicationCount);

    res.json({
      totals: {
        users: users.length,
        students: students.length,
        consultants: consultants.length,
        admins: admins.length,
        universities: universities.length,
        applications: applications.length,
        profiles: studentProfiles.length,
        activeUsers,
      },
      applicationsByStatus,
      applicationsByCountry,
      mostAppliedColleges,
      popularCourses,
      recentUsers: users
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8)
        .map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
      recentApplications: applications
        .slice()
        .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
        .slice(0, 8)
        .map((a) => ({
          _id: a._id,
          studentName: a.studentName || a.student?.name,
          studentEmail: a.studentEmail || a.student?.email,
          universityName: a.universityName || a.university?.name,
          country: a.country || a.university?.country,
          course: a.course,
          status: a.status,
          submittedDate: a.submittedDate,
        })),
      students: studentsData,
      consultants: consultantsData,
      // Full populated applications (studentProfile attached) so the admin
      // can open the same Student Application Details view as consultants.
      applications: applications.map((a) => {
        const obj = a.toObject();
        obj.studentProfile =
          profileByUser[a.student?._id?.toString()] || null;
        return obj;
      }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all consultant profiles with assigned students
// @route   GET /api/admin/consultants
// @access  Private (Admin)
exports.getConsultants = async (req, res) => {
  try {
    const consultants = await User.find({ role: "consultant" }).select("-password");
    const profiles = await ConsultantProfile.find({})
      .populate("user", "name email")
      .populate("assignedStudents", "name email");

    const result = consultants.map((c) => {
      const profile = profiles.find(
        (p) => p.user?._id?.toString() === c._id.toString()
      );
      return {
        _id: c._id,
        name: c.name,
        email: c.email,
        profileId: profile?._id || null,
        expertise: profile?.expertise || [],
        bio: profile?.bio || "",
        assignedStudents: profile?.assignedStudents || [],
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update consultant's assigned students
// @route   PUT /api/admin/consultants/:id/students
// @access  Private (Admin)
exports.updateConsultantStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: "studentIds must be an array" });
    }

    const consultant = await User.findById(req.params.id);
    if (!consultant || consultant.role !== "consultant") {
      return res.status(404).json({ message: "Consultant not found" });
    }

    // Verify all student IDs exist and are students
    const validStudents = await User.find({
      _id: { $in: studentIds },
      role: "student",
    });
    const validIds = validStudents.map((s) => s._id);

    // Upsert the consultant profile with the new assigned students
    let profile = await ConsultantProfile.findOne({ user: consultant._id });
    if (!profile) {
      profile = await ConsultantProfile.create({
        user: consultant._id,
        expertise: [],
        bio: "",
        assignedStudents: validIds,
      });
    } else {
      profile.assignedStudents = validIds;
      await profile.save();
    }

    const populated = await profile.populate("assignedStudents", "name email");
    res.json({
      message: `Assigned ${validIds.length} students to ${consultant.name}`,
      assignedStudents: populated.assignedStudents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a university
// @route   POST /api/admin/universities
// @access  Private (Admin)
exports.addUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json(university);
  } catch (error) {
    if (error.name === "ValidationError" || error.code === 11000) {
      const message = error.code === 11000
        ? "A university with this name already exists"
        : Object.values(error.errors || {}).map((e) => e.message).join("; ");
      return res.status(400).json({ message });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
