const mongoose = require("mongoose");

const studyAbroadSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    title: { type: String, trim: true, default: "" },
    description: { type: String, default: "" },
    country:{type:String,default:""},
    additionalInformation: {
      topUniversities: [{ type: String, trim: true, default: "" }],
      workOpportunitiesIndianStudents: { type: String, default: "" },
      investment: { type: String, default: "" },
    },

    whyChoose: [{ type: String, default: "" }],

    usEducationalSystem: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    admissionRequirements: [
      {
        title: { type: String, default: "" },
        points: [{ type: String, default: "" }],
      },
    ],

    topCourses: [{ type: String, default: "" }],

    visaProcess: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    countryDetails: {
      capital: { type: String, default: "" },
      topCities: [{ type: String, default: "" }],
      universities: [{ type: String, default: "" }],
      indianStudents: { type: String, default: "" },
      currency: { type: String, default: "" },
      language: { type: String, default: "" },
    },

    topUniversities: [{ type: String, default: "" }],

    intakePeriod: {
      fallIntake: { type: String, default: "" },
      springIntake: { type: String, default: "" },
      summerIntake: { type: String, default: "" },
    },

    popularScholarships: [{ type: String, default: "" }],

    financialRequirements: {
      tuitionFees: { type: String, default: "" },
      livingCosts: { type: String, default: "" },
      totalProofRequired: { type: String, default: "" },
    },

    workOpportunities: {
      duringStudies: { type: String, default: "" },
      afterGraduation: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyAbroad", studyAbroadSchema);
