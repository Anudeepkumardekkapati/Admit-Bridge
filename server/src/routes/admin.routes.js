const express = require("express");
const router = express.Router();
const { getUsers, getUniversities, addUniversity, getAnalytics, getConsultants, getStudents, updateConsultantStudents } = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/users", getUsers);
router.get("/students", getStudents);
router.get("/consultants", getConsultants);
router.get("/universities", getUniversities);
router.get("/analytics", getAnalytics);
router.post("/universities", addUniversity);
router.put("/consultants/:id/students", updateConsultantStudents);

module.exports = router;
