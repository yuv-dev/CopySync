const Device = require("../models/deviceModel");

exports.registerDevice = async (req) => {
  try {

    const { deviceId, deviceType, userAgent, platform } = req.body;
    
    const userId = req.user.id;

    const device = await Device.findOneAndUpdate(
      { userId, deviceId },
      {
        userId,
          deviceType,
          userAgent,
          platform,
          lastSeen: new Date(),
      },
      { upsert: true, new:true }
    );

    return device;
  } catch (error) {
    console.log("Error registering device:", error);
    return;
  }
};

exports.unregisterDevice = async (req) => {
  const { deviceId } = req.body;
  const userId = req.user.id;

  const deletedDevice = await Device.deleteOne({ userId, deviceId });
  if (deletedDevice.deletedCount === 0) {
    return { message: "Device not found or already unregistered"};
  }
  else{
    return { message: "Device unregistered successfully" };
  }
};

exports.getAllDevices = async (req) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return [];
    }
    // Fetch all devices for the user, sorted by lastSeen in descending order
    const devices = await Device.find({ userId }).sort({ lastSeen: -1 });
    return devices;
  } catch (error) {
    throw new Error("Error fetching devices: " + error.message);
  }
};
