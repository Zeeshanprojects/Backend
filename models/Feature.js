const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: mongoose.Schema.Types.Mixed, required: true },
  schema: { type: String, required: true },
});

module.exports = mongoose.model('Feature', featureSchema);
