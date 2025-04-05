const mongoose = require('mongoose');

const mentionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photo", required: true },
  comment_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  date_time: { type: Date, default: Date.now },
});

// Create the model
const Mention = mongoose.model('Mention', mentionSchema);

module.exports = Mention;