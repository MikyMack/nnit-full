const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === "application/pdf";

    return {
      folder: "courses",
      resource_type: isPDF ? "raw" : "image",
      type: "upload",         
      access_mode: "public",   
      use_filename: true,      
      unique_filename: false,  
      format: isPDF ? "pdf" : undefined,
    };
  },
});


const upload = multer({ storage });

// Routes
router.post("/", upload.fields([{ name: "image" }, { name: "pdf" }]), courseController.createCourse);
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourseById);
router.put("/:id", upload.fields([{ name: "image" }, { name: "pdf" }]), courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);
router.patch("/:id/toggle-active", courseController.toggleCourseActive);

module.exports = router;
