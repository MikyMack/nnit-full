const multer = require('multer');

const fileFilter = (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const pdfType = /pdf/;
    const ext = file.originalname.split('.').pop().toLowerCase();
    const mimetype = file.mimetype;

    if (
        (imageTypes.test(ext) && imageTypes.test(mimetype)) ||
        (pdfType.test(ext) && pdfType.test(mimetype))
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only image files and PDFs are allowed'));
    }
};

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

module.exports = upload;
