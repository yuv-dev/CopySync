const ClipboardService = require("../services/clipboardService");

exports.postClipboard = async (req, res) => {
  try {
    const item = await ClipboardService.saveClipboard(req);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClipboardHistory = async (req, res) => {

  console.log("Fetching clipboard history from Google Drive...", req.body); 
  try {
    const items = await ClipboardService.getClipboardHistoryFromDrive(req);
    
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleSync = async (req, res) => {
  try {
    const updated = await ClipboardService.toggleSync(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
