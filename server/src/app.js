const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const predictionRoutes = require("./routes/prediction.routes");
const consultantRoutes = require("./routes/consultant.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/consultant", consultantRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
