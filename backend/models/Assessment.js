const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true }, 
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" } 
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
