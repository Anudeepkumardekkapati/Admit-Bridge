const express = require("express");
const router = express.Router();
const { getStudentProfile, updateStudentProfile, getStudentApplications, createApplication } = require("../controllers/student.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorizeRoles("student", "admin"));

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/applications", getStudentApplications);
router.post("/applications", createApplication);

module.exports = router;
