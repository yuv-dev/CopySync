const AuthService = require("../services/authService");
const {FRONTEND_URL} = require("../config/env");

exports.registerUser = async (req, res) => {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const result = await AuthService.loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    // const result  = {
    //   name: "John Doe",
    //   email: "yuvr@gmail.com"
    // }

    const result = await AuthService.googleLogin(req.body.credential);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.googleDriveCallback = async (req, res) => {
  try {
     await AuthService.googleDriveCallback(req);
    res.redirect(FRONTEND_URL + "/dashboard");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
