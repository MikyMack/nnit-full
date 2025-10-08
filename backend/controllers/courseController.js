const Course = require("../models/Course");
const cloudinary = require("cloudinary").v2;

// Create new course

exports.createCourse = async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        coreModules,
        learningOutcomes,
        specialization,
        opportunities,
        youtubeLink,
        whyChoose,
        courseInformation,
        isactive
      } = req.body;
  
      const image = req.files?.image?.[0]?.path || req.files?.image?.[0]?.secure_url || null;
      const pdf = req.files?.pdf?.[0]?.path || req.files?.pdf?.[0]?.secure_url || null;
      
  
      // ✅ Safely parse only JSON string fields
      const parsedCoreModules = coreModules
        ? (typeof coreModules === "string" ? JSON.parse(coreModules) : coreModules)
        : [];
  
      const parsedLearningOutcomes = learningOutcomes
        ? (typeof learningOutcomes === "string" ? JSON.parse(learningOutcomes) : learningOutcomes)
        : [];
  
      const parsedOpportunities = opportunities
        ? (typeof opportunities === "string" ? JSON.parse(opportunities) : opportunities)
        : [];
  
      const parsedWhyChoose = whyChoose
        ? (typeof whyChoose === "string" ? JSON.parse(whyChoose) : whyChoose)
        : [];
  
      // ✅ Do NOT JSON.parse courseInformation — it's already an object
      const parsedCourseInfo = courseInformation || {};
  
      const newCourse = new Course({
        title,
        description,
        category,
        coreModules: parsedCoreModules,
        learningOutcomes: parsedLearningOutcomes,
        specialization,
        image,
        pdf,
        opportunities: parsedOpportunities,
        youtubeLink,
        whyChoose: parsedWhyChoose,
        courseInformation: parsedCourseInfo,
        isactive: typeof isactive !== "undefined" ? isactive : true
      });
  
      await newCourse.save();
      res.status(201).json({ success: true, message: "Course created", course: newCourse });
  
    } catch (err) {
      console.error("Error creating course:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  // Update course
exports.updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      coreModules,
      learningOutcomes,
      specialization,
      opportunities,
      youtubeLink,
      whyChoose,
      courseInformation,
      isactive
    } = req.body;

    // ✅ Safely parse JSON string fields
    const parsedCoreModules = coreModules
      ? (typeof coreModules === "string" ? JSON.parse(coreModules) : coreModules)
      : [];

    const parsedLearningOutcomes = learningOutcomes
      ? (typeof learningOutcomes === "string" ? JSON.parse(learningOutcomes) : learningOutcomes)
      : [];

    const parsedOpportunities = opportunities
      ? (typeof opportunities === "string" ? JSON.parse(opportunities) : opportunities)
      : [];

    const parsedWhyChoose = whyChoose
      ? (typeof whyChoose === "string" ? JSON.parse(whyChoose) : whyChoose)
      : [];

    const parsedCourseInfo = courseInformation || {};

    // ✅ Construct update object safely
    const updatedData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(specialization && { specialization }),
      ...(youtubeLink && { youtubeLink }),
      ...(typeof isactive !== "undefined" && { isactive }),
      coreModules: parsedCoreModules,
      learningOutcomes: parsedLearningOutcomes,
      opportunities: parsedOpportunities,
      whyChoose: parsedWhyChoose,
      courseInformation: parsedCourseInfo
    };

    // ✅ Handle Cloudinary files properly
    if (req.files?.image?.length) {
      updatedData.image =
        req.files.image[0].secure_url ||
        req.files.image[0].path ||
        null;
    }

    if (req.files?.pdf?.length) {
      updatedData.pdf =
        req.files.pdf[0].secure_url ||
        req.files.pdf[0].path ||
        null;
    }

    // ✅ Update the course
    const course = await Course.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated successfully", course });

  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




exports.toggleCourseActive = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    course.isactive = !course.isactive;
    await course.save();

    res.status(200).json({ success: true, message: "Course active status toggled", isactive: course.isactive, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (course.image) {
      try {
        const imageUrl = course.image;
        const imageMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.\/]+(?:\/[^\.\/]+)*)/);
        if (imageMatch && imageMatch[1]) {
          await cloudinary.uploader.destroy(imageMatch[1], { resource_type: "image" });
        }
      } catch (err) {
        console.error("Error deleting course image from Cloudinary:", err.message);
      }
    }

    if (course.pdf) {
      try {
        const pdfUrl = course.pdf;
        const pdfMatch = pdfUrl.match(/\/upload\/(?:v\d+\/)?([^\.\/]+(?:\/[^\.\/]+)*)/);
        if (pdfMatch && pdfMatch[1]) {
          await cloudinary.uploader.destroy(pdfMatch[1], { resource_type: "raw" });
        }
      } catch (err) {
        console.error("Error deleting course PDF from Cloudinary:", err.message);
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
