const StudyAbroad = require("../models/StudyAbroad");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create StudyAbroad entry
exports.createStudyAbroad = async (req, res) => {
  try {
    let {
      title,
      description,
      country,
      additionalInformation,
      whyChoose,
      usEducationalSystem,
      admissionRequirements,
      topCourses,
      visaProcess,
      countryDetails,
      topUniversities,
      intakePeriod,
      popularScholarships,
      financialRequirements,
      workOpportunities
    } = req.body;

    // Helper to extract first value if array, else return as is
    const getString = (val) => {
      if (Array.isArray(val)) return val[0];
      return val;
    };

    // Helper to parse array of objects (for complex fields)
    const parseArrayOfObjects = (val) => {
      if (!val) return [];
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === "object") return [parsed];
        } catch {
          // fallback: not a JSON string, return empty array
          return [];
        }
      }
      if (Array.isArray(val)) return val;
      return [];
    };

    // Helper to parse array of strings (for simple string arrays)
    const parseArray = (val) => {
      if (!val) return [];
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === "string") return [parsed];
        } catch {
          return val.split(",").map(v => v.trim()).filter(Boolean);
        }
      }
      if (Array.isArray(val)) return val;
      return [];
    };

    // Helper to parse object
    const parseObject = (val) => {
      if (!val) return {};
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return {};
        }
      }
      if (typeof val === "object") return val;
      return {};
    };

    // Fix for string fields that may come as arrays
    title = getString(title) || "Default Title";
    description = getString(description) || "";
    country = getString(country) || "Default Country";

    additionalInformation = parseObject(additionalInformation);
    whyChoose = parseArray(whyChoose);
    // These three fields are arrays of objects, not just strings
    usEducationalSystem = parseArrayOfObjects(usEducationalSystem);
    admissionRequirements = parseArrayOfObjects(admissionRequirements);
    visaProcess = parseArrayOfObjects(visaProcess);
    topCourses = parseArray(topCourses);
    countryDetails = parseObject(countryDetails);
    topUniversities = parseArray(topUniversities);
    intakePeriod = parseObject(intakePeriod);
    popularScholarships = parseArray(popularScholarships);
    financialRequirements = parseObject(financialRequirements);
    workOpportunities = parseObject(workOpportunities);

    // Handle image upload
    let imageUrl = "";
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "studyabroad" });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        // Continue without image instead of crashing
      }
    }

    const newEntry = new StudyAbroad({
      title,
      description,
      country,
      image: imageUrl,
      additionalInformation,
      whyChoose,
      usEducationalSystem,
      admissionRequirements,
      topCourses,
      visaProcess,
      countryDetails,
      topUniversities,
      intakePeriod,
      popularScholarships,
      financialRequirements,
      workOpportunities
    });

    await newEntry.save();

    res.status(201).json({ success: true, entry: newEntry });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update StudyAbroad entry
exports.updateStudyAbroad = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;

    // Helper to extract first value if array, else return as is
    const getString = (val) => {
      if (Array.isArray(val)) return val[0];
      return val;
    };

    // Helper to parse array of objects (for complex fields)
    const parseArrayOfObjects = (val) => {
      if (!val) return [];
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === "object") return [parsed];
        } catch {
          return [];
        }
      }
      if (Array.isArray(val)) return val;
      return [];
    };

    // Helper to parse array of strings (for simple string arrays)
    const parseArray = (val) => {
      if (!val) return [];
      if (typeof val === "string") {
        try {
          const arr = JSON.parse(val);
          if (Array.isArray(arr)) return arr;
          if (typeof arr === "string") return [arr];
        } catch (e) {
          return val.split(",").map(x => x.trim()).filter(Boolean);
        }
      }
      if (Array.isArray(val)) return val;
      return [];
    };

    const parseObject = (val) => {
      if (!val) return {};
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return {};
        }
      }
      if (typeof val === "object") return val;
      return {};
    };

    // Fix for string fields that may come as arrays
    if ("title" in updateData) updateData.title = getString(updateData.title);
    if ("description" in updateData) updateData.description = getString(updateData.description);
    if ("country" in updateData) updateData.country = getString(updateData.country);

    if ("additionalInformation" in updateData)
      updateData.additionalInformation = parseObject(updateData.additionalInformation);
    if ("whyChoose" in updateData)
      updateData.whyChoose = parseArray(updateData.whyChoose);
    // These three fields are arrays of objects, not just strings
    if ("usEducationalSystem" in updateData)
      updateData.usEducationalSystem = parseArrayOfObjects(updateData.usEducationalSystem);
    if ("admissionRequirements" in updateData)
      updateData.admissionRequirements = parseArrayOfObjects(updateData.admissionRequirements);
    if ("visaProcess" in updateData)
      updateData.visaProcess = parseArrayOfObjects(updateData.visaProcess);
    if ("topCourses" in updateData)
      updateData.topCourses = parseArray(updateData.topCourses);
    if ("countryDetails" in updateData)
      updateData.countryDetails = parseObject(updateData.countryDetails);
    if ("topUniversities" in updateData)
      updateData.topUniversities = parseArray(updateData.topUniversities);
    if ("intakePeriod" in updateData)
      updateData.intakePeriod = parseObject(updateData.intakePeriod);
    if ("popularScholarships" in updateData)
      updateData.popularScholarships = parseArray(updateData.popularScholarships);
    if ("financialRequirements" in updateData)
      updateData.financialRequirements = parseObject(updateData.financialRequirements);
    if ("workOpportunities" in updateData)
      updateData.workOpportunities = parseObject(updateData.workOpportunities);

    // Handle image upload
    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "studyabroad" });
      updateData.image = result.secure_url;
    }

    const updatedEntry = await StudyAbroad.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, entry: updatedEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all entries
exports.getStudyAbroads = async (req, res) => {
  try {
    const entries = await StudyAbroad.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single entry
exports.getStudyAbroadById = async (req, res) => {
  try {
    const entry = await StudyAbroad.findById(req.params.id).lean();
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// Delete entry
exports.deleteStudyAbroad = async (req, res) => {
  try {
    await StudyAbroad.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
