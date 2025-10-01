const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, 
    employmentType: { 
      type: String, 
      enum: ["Full Time", "Part Time", "Contract", "Internship"], 
      required: true 
    },
    location: { type: String, required: true }, 
    workArrangement: {
      type: String,
      enum: ["Onsite", "Remote", "Hybrid", "WFH"],
      required: true
    },
    experience: { type: String, required: true }, 
    description: { type: String, required: true }, 
    skills: [{ type: String, required: true }], 
    postedDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
