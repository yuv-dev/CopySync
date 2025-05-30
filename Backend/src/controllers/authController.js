const AuthService = require("../services/authService");

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
    console.log("Attempting to get Google Drive callback");
     await AuthService.googleDriveCallback(req);
    res.redirect("http://localhost:3000/dashboard");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
