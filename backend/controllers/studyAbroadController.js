const StudyAbroad = require("../models/StudyAbroad");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createStudyAbroad = async (req, res) => {
  try {
    const { title, description, moreDetails, universities, visa, country } = req.body;

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "studyabroad" });
      imageUrl = result.secure_url;
    }

    let universitiesArray = [];
    if (universities) {
      if (Array.isArray(universities)) {
        universitiesArray = universities;
      } else if (typeof universities === "string") {
     
        try {
          universitiesArray = JSON.parse(universities);
          if (!Array.isArray(universitiesArray)) {
            universitiesArray = [universitiesArray];
          }
        } catch (e) {
        
          universitiesArray = universities.split(",").map(u => u.trim()).filter(u => u.length > 0);
        }
      }
    }

    const newEntry = new StudyAbroad({
      title,
      description,
      moreDetails,
      universities: universitiesArray,
      visa,
      country,
      image: imageUrl
    });

    await newEntry.save();
    res.status(201).json({ success: true, entry: newEntry });
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

// Update entry
exports.updateStudyAbroad = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle universities: accept either a JSON array string or a comma-separated string
    if (updateData.universities) {
      if (Array.isArray(updateData.universities)) {
        // already array
      } else if (typeof updateData.universities === "string") {
        try {
          updateData.universities = JSON.parse(updateData.universities);
          if (!Array.isArray(updateData.universities)) {
            updateData.universities = [updateData.universities];
          }
        } catch (e) {
          updateData.universities = updateData.universities.split(",").map(u => u.trim()).filter(u => u.length > 0);
        }
      }
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "studyabroad" });
      updateData.image = result.secure_url;
    }

    const updatedEntry = await StudyAbroad.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, entry: updatedEntry });
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
