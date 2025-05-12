const mongoose = require('mongoose');
const DeviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  os: String,
  Mac: String,
  sync: Boolean
});
module.exports = mongoose.model('Device', DeviceSchema);
