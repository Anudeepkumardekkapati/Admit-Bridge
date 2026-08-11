const University = require("../models/University");

// @desc    List all universities (public catalog)
// @route   GET /api/universities
// @access  Public
exports.getUniversities = async (req, res) => {
  try {
    const { country, q } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }
    const universities = await University.find(filter).sort({ worldRank: 1 });
    res.json(universities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single university
// @route   GET /api/universities/:id
// @access  Public
exports.getUniversityById = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.json(university);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
