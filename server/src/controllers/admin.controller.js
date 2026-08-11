const User = require("../models/User");
const University = require("../models/University");

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
