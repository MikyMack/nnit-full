const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "events";
    return { folder, resource_type: file.mimetype.includes("pdf") ? "raw" : "image" };
  }
});
const upload = multer({ storage });

router.post("/createEvent", upload.array("images", 3), eventController.createEvent);
router.get("/getEvents", eventController.getEvents);
router.get("/getEventById/:id", eventController.getEventById);
router.put("/updateEvent/:id", upload.array("images", 3), eventController.updateEvent);
router.delete("/deleteEvent/:id", eventController.deleteEvent);
router.patch("/toggleEventStatus/:id", eventController.toggleEventStatus);


module.exports = router;
