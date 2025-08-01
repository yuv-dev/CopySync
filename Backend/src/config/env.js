// Environment variable loader
require("dotenv").config();
module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_REDIRECT_URI: "http://localhost:5000/api/auth/google/callback",
  FRONTEND_URL: "http://localhost:3000",
  BACKEND_URL: "http://localhost:5000",
};
