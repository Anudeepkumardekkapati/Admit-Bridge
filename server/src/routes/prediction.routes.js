const express = require("express");
const router = express.Router();
const { generatePredictions, getPredictions } = require("../controllers/prediction.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorizeRoles("student", "admin"));

router.post("/generate", generatePredictions);
router.get("/", getPredictions);

module.exports = router;
