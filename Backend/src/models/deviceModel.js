const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deviceId: {type:String, unique:true},
  deviceType: String,
  userAgent: String,
  platform: String,
  lastSeen: Date,
  sync: Boolean,
  createdAt:{type:Date, default:Date.now} 
});

DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("Device", DeviceSchema);
