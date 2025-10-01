const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "courses";
    let resource_type = "image";

    if (file.mimetype === "application/pdf") {
      resource_type = "raw"; // pdf uploads
    }

    return {
      folder,
      resource_type,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "pdf"],
    };
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
