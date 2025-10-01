const mongoose = require("mongoose");

const studyAbroadSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  description: { type: String, default: "" },
  moreDetails: { type: String, default: "" },
  universities: [{ type: String, trim: true }], 
  visa: { type: String, default: "" },
  image: { type: String }, 
  country: { type: String, trim: true, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("StudyAbroad", studyAbroadSchema);
