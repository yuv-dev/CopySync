const { uploadClipboardToDrive } = require('../utils/driveUtil');

exports.saveClipboard = async (userId, { data, deviceId, encrypted, timestamp }) => {
  const filename = `clipboard-${Date.now()}.txt`;
  const driveResult = await uploadClipboardToDrive(filename, data);
  return { filename, driveFileId: driveResult.id, timestamp };
};

exports.getHistory = async (userId) => {
  // Normally, you'd list files or maintain metadata in DB
  return [{ message: "Get history from Google Drive or metadata DB" }];
};

exports.toggleSync = async (userId, { deviceId, status }) => {
  return { message: "Sync toggling not implemented for Drive yet" };
};
