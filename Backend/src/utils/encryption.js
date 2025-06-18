// Encryption/decryption logic
const bcrypt = require('bcrypt');


exports.encryptPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw new Error("Encryption failed");
  }
};
exports.comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    throw new Error("Comparison failed");
  }
};
exports.encryptData = async (data) => {
  try {
    const saltRounds = 10;
    const hashedData = await bcrypt.hash(data, saltRounds);
    return hashedData;
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Encryption failed");
  }
};
exports.decryptData = async (data, hashedData) => {
  try {
    const isMatch = await bcrypt.compare(data, hashedData);
    return isMatch;
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Decryption failed");
  }
};
exports.generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
