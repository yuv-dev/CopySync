const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  picture: String,
  createdAt: { type: Date, default: Date.now },
  driveAccessToken :String,
  driveRefreshToken :String,
});
UserSchema.static.comparePassword = async function (password) {
  //  bcrypt for password hashing
  const bcrypt = require("bcrypt");
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
