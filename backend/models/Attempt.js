const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  guestDetails: {
    name: String,
    email: String,
    phone: String
  },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selected: Number,
      isCorrect: Boolean
    }
  ],
  score: { type: Number, default: 0 },
  isResultUnlocked: { type: Boolean, default: false },
  unlockMethod: { type: String, enum: ["coupon", "payment", null], default: null }
}, { timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);
