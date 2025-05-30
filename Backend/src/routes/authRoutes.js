const express = require("express");
const router = express.Router();

const {
  googleLogin,
  googleDriveCallback,
  registerUser,
  loginUser,
} = require("../controllers/authController");
router.post("/google-login", googleLogin);
router.get("/google/callback", googleDriveCallback);

router.post("/signup", registerUser);
router.post("/signin", loginUser);

module.exports = router;
