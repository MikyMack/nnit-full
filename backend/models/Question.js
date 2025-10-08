const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], 
  correctAnswer: { type: Number, required: true },
  category: { type: String, trim: true },
  explanation: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);