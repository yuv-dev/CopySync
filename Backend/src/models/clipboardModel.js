const mongoose = require('mongoose');
const ClipboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: String,
  deviceId: String,
  encrypted: Boolean,
  timestamp: Date
});
module.exports = mongoose.model('Clipboard', ClipboardSchema);
