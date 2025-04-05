"use strict";

const mongoose = require('mongoose');

/**
 * Define the Mongoose Schema for a Mention.
 */
const mentionSchema = new mongoose.Schema({
  // Mention хийгдсэн хэрэглэгч
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Mention хийсэн зураг
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photo", required: true },
  // Mention хийсэн сэтгэгдэл
  comment_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  // огноо
  date_time: { type: Date, default: Date.now },
});

/**
 * Create a Mongoose Model for a Mention using the mentionSchema.
 */
const Mention = mongoose.model("Mention", mentionSchema);

/**
 * Make this available to our application.
 */
module.exports = Mention;
