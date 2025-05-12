const express = require("express");
const router = express.Router();

const {
  googleLogin,
  registerUser,
  loginUser,
} = require("../controllers/authController");
router.post("/google-login", googleLogin);
router.post("/signup", registerUser);
router.post("/signin", loginUser);

module.exports = router;
