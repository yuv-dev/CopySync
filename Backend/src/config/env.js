// Environment variable loader
require("dotenv").config();
module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_REDIRECT_URI: "https://clipsync-backend.loca.lt/api/auth/google/callback",
  FRONTEND_URL: "https://clipsync-frontend.loca.lt",
  BACKEND_URL: "https://clipsync-backend.loca.lt",
};
