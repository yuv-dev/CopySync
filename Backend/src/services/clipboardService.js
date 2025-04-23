const Clipboard = require('../models/clipboardModel');
const Device = require('../models/deviceModel');

exports.saveClipboard = async (userId, { data, deviceId, encrypted, timestamp }) => {
  return await Clipboard.create({ user: userId, data, deviceId, encrypted, timestamp });
};

exports.getHistory = async (userId) => {
  return await Clipboard.find({ user: userId }).sort({ timestamp: -1 }).limit(100);
};

exports.toggleSync = async (userId, { deviceId, status }) => {
  return await Device.findOneAndUpdate({ user: userId, _id: deviceId }, { sync: status }, { new: true });
};
