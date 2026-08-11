const express = require("express");
const router = express.Router();
const {
  getUniversities,
  getUniversityById,
} = require("../controllers/university.controller");

router.get("/", getUniversities);
router.get("/:id", getUniversityById);

module.exports = router;
