const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { JWT_SECRET } = require("../config/env");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) return res.status(401).json({ error: "Invalid token" });

    // Check if the user exists
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ error: "User not found" });
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else {
      return res.status(403).json({ message: "Invalid token" });
    }
  }
};
