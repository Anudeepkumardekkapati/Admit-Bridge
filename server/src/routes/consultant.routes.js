const express = require("express");
const router = express.Router();
const { getConsultantDashboard, updateApplicationStatus } = require("../controllers/consultant.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorizeRoles("consultant", "admin"));

router.get("/dashboard", getConsultantDashboard);
router.patch("/applications/:id/status", updateApplicationStatus);

module.exports = router;
