"use strict";

const mongoose = require('mongoose');

/**
 * Define the Mongoose Schema for a Activity.
 */
const activitySchema = new mongoose.Schema({
  // Activity-ийг үүсгэсэн хэрэглэгч
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Activity-ний төрөл
  activity_type: { type: String, enum: ["Photo Upload", "New Comment", "User Registration", "User Login", "User Logout"], required: true },
  // Хэрэв байвал холбоотой зургийн дугаарыг хадгална.
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
  // Хэрэв байвал холбоотой сэтгэгдлийн дугаарыг хадгална.
  comment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  // огноо
  date_time: { type: Date, default: Date.now },
});

/**
 * Create a Mongoose Model for a Activity using the activitySchema.
 */
const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;