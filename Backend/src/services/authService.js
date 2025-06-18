const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require("../config/env");

const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const { encryptPassword, comparePassword } = require("../utils/encryption");

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

exports.googleLogin = async (credential) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const { email, name, picture, sub: googleId } = ticket.getPayload();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email, googleId, picture });
  } else {
    user.name = name;
    user.googleId = googleId;
    user.picture = picture;
    await user.save();
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

  // Generate new OAuth2 token with Drive scopes
  const scopes = ["https://www.googleapis.com/auth/drive.file"];
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: JSON.stringify({ userId: user._id }), // Pass user ID in state
  });

  return { token, authUrl, user };
};

//Google Drive OAuth2 Callback
exports.googleDriveCallback = async (req) => {
  const { code, state } = req.query;
  const { userId } = JSON.parse(state);

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).send("User not found");
  }

  user.driveAccessToken = tokens.access_token;
  user.driveRefreshToken = tokens.refresh_token; // Save this for future use
  await user.save();
};

// ***************************************************************************************************************

//Register New User via Email and Password
// This function registers a new user with the provided name, email, and password.
exports.registerUser = async ({ name, email, password }) => {
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await encryptPassword(password);
    if (!hashedPassword) {
      throw new Error("Error hashing password");
    }
    const user = await User.create({ name, email, password: hashedPassword });
    console.log("User created successfully", user);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return { token, user };
  } catch (err) {
    console.error(err);
    throw new Error("Error registering user");
  }
};

//Login User via Email and Password
exports.loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    console.log("User found:", user);
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return { token, user };
  } catch (err) {
    console.error(err);
    throw new Error("Error logging in user");
  }
};
