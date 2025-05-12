const { GOOGLE_CLIENT_ID, JWT_SECRET } = require("../config/env");

const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { encryptPassword, comparePassword } = require("../utils/encryption");

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
console.log("Google Client ID:", GOOGLE_CLIENT_ID);

exports.googleLogin = async (credential) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience:
    GOOGLE_CLIENT_ID,
  });

  const { email, name, sub: googleId } = ticket.getPayload();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email, googleId });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  return { token, user };
};

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
    console.log("User created successfully");
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
