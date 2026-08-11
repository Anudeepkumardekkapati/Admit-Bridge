const app = require("./src/app");
const config = require("./src/config/env");
const connectDB = require("./src/config/db");

// Connect to MongoDB, then start the Express server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`AdmitBridge server running on http://localhost:${config.port}`);
  });
});
