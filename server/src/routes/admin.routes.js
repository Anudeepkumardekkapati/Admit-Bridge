const express = require("express");
const router = express.Router();
const { getUsers, getUniversities, addUniversity } = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/users", getUsers);
router.get("/universities", getUniversities);
router.post("/universities", addUniversity);

module.exports = router;
