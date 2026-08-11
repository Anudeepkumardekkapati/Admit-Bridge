const express = require("express");
const router = express.Router();
const { getStudentProfile, updateStudentProfile, getStudentApplications } = require("../controllers/student.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorizeRoles("student", "admin"));

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/applications", getStudentApplications);

module.exports = router;
