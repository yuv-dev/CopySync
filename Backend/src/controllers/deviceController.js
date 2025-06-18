const DeviceService = require("../services/deviceService");

exports.registerDevice = async (req, res) => {
  try {
    const device = await DeviceService.registerDevice(req);
    if (!device) {
      return res.status(400).json({ error: "Device registration failed" });
    }
    return res.status(200).json(device);
  } catch (err) {
     return res.status(500).json({ error: err.message });
  }
};

exports.unregisterDevice = async (req, res) => {
  try {
    const result = await DeviceService.unregisterDevice(req);
    return  res.status(200).json({ message: "Device unregistered" });
  } catch (err) {
    return  res.status(500).json({ error: err.message });
  }
};

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await DeviceService.getAllDevices(req);
    return res.status(200).json(devices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
