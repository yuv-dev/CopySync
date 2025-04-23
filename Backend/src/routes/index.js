express = require("express");
const authRoutes = require("./authRoutes");
const clipboardRoutes = require("./clipboardRoutes");
const router = express.Router();

// Define your routes here
router.use("/auth", authRoutes);
router.use("/clipboard", clipboardRoutes);

return router;

module.exports = router;
