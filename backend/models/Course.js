const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },

  category: { type: String, required: true, trim: true },

  coreModules: [{ type: String, trim: true }],
  learningOutcomes: [{ type: String, trim: true }],
  specialization: { type: String, trim: true },

  image: { type: String }, 
  pdf: { type: String }, 

  opportunities: [{ type: String, trim: true }],
  youtubeLink: { type: String, trim: true },

  whyChoose: [{ type: String, trim: true }],
  courseInformation: {
    certifications: { type: String, trim: true },
    curriculum: { type: String, trim: true },
    duration: { type: String, trim: true },
    language: { type: String, trim: true },
    students: { type: String, trim: true },
  },
  isactive: { type: Boolean, default: true }
}, { timestamps: true });

courseSchema.statics.getAllCategories = async function() {
  const categories = await this.distinct("category");
  return categories;
};

courseSchema.statics.getCategoriesWithCount = async function () {
  const categories = await this.aggregate([
    { $match: { isactive: true } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);


  return categories.map((cat, index) => ({
    name: cat._id,
    count: cat.count,
    icon: `/images/category/category-1/${index + 1}.svg`, 
  }));
};

module.exports = mongoose.model("Course", courseSchema);
