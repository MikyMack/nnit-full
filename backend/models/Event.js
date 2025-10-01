const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  images: [{ type: String }],
  date: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  seats: { type: Number, required: true },
  tag: { type: String, trim: true },
  description: { type: String, required: true },
  highlights: [{ type: String, trim: true }],
  moreDetails: { type: String },
  venue: { type: String, trim: true },
  email: { type: String, trim: true },
  number: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
