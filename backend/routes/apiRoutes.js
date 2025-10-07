const express = require('express');
const router = express.Router();
const User =require('../models/User') 
const authController = require('../controllers/authController'); 
const blogsController = require('../controllers/blogsController');
const testimonialController = require('../controllers/testimonialController');
const contactController = require("../controllers/contactController");
const studyAbroadController = require("../controllers/studyAbroadController");
const nodemailer = require('nodemailer');
const authenticateUser = require('../middleware/auth');
const PDFDocument = require('pdfkit');

const { upload } = require('../config/cloudinary');



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

router.post("/contactsubmit", contactController.submitContact);
router.patch("/replied/:id", contactController.markReplied);


router.post("/createStudyAbroad", upload.single("image"), studyAbroadController.createStudyAbroad);
router.get("/getStudyAbroads", studyAbroadController.getStudyAbroads);
router.get("/getStudyAbroadById/:id", studyAbroadController.getStudyAbroadById);
router.put("/updateStudyAbroad/:id", upload.single("image"), studyAbroadController.updateStudyAbroad);
router.delete("/deleteStudyAbroad/:id", studyAbroadController.deleteStudyAbroad);

router.post('/testimonials/create', upload.single('profilePic'), testimonialController.createTestimonial); // Create Testimonial
router.get('/testimonials', testimonialController.getAllTestimonials);                                   // Get all Testimonials
router.put('/testimonials/edit/:id', upload.single('profilePic'), testimonialController.editTestimonial); // Edit Testimonial
router.put('/testimonials/toggle/:id', testimonialController.toggleTestimonial);                        // Toggle Testimonial
router.delete('/testimonials/delete/:id', testimonialController.deleteTestimonial);                     // Delete Testimonial

// Routes for managing blog
router.post('/blog/create', upload.single('blogImage'), blogsController.createBlog); // Create Blog
router.get('/blogs', blogsController.getAllBlogs);                                   // Get all Blogs
router.put('/blogs/edit/:id', upload.single('blogImage'), blogsController.editBlog); // Edit Blog
router.delete('/blogs/delete/:id', blogsController.deleteBlog);                      // Delete Blog



router.post('/send-contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
        return res.status(400).send('Please fill in all required fields.');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'IIMF Enquiry Form',
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send(`
            <style>
                .alert-box {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #28a745;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-size: 18px;
                    text-align: center;
                }
                .alert-buttons {
                    margin-top: 10px;
                }
                .alert-button {
                    background-color: #ffffff;
                    color: #28a745;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 5px;
                }
                .alert-button:hover {
                    background-color: #f1f1f1;
                }
            </style>
            <div class="alert-box">
                Thank you! Your message has been sent successfully.
                <div class="alert-buttons">
                    <button class="alert-button" onclick="window.location.href='/contact'">OK</button>
                    <button class="alert-button" onclick="window.history.back()">Back</button>
                </div>
            </div>
        `);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send message.');
    }
});



router.put('/admin-make-admin/:id', authController.makeAdmin);
router.put('/admin-block-user/:id', authController.blockUser);
router.put('/admin-remove-admin/:id', authController.removeAdmin);
router.put('/admin-unblock-user/:id', authController.unblockUser);

router.get('/download-user-list', async (req, res) => {
    try {
        const format = req.query.format; // Get the format (csv or pdf)
        const users = await User.find(); // Fetch all users

        if (format === 'pdf') {
            // Create a PDF document
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=user-list.pdf');
            doc.pipe(res);

            // Add content to the PDF
            doc.fontSize(14).text('User List', { align: 'center' });
            doc.moveDown();

            users.forEach(user => {
                doc.fontSize(12).text(`Name: ${user.name}`);
                doc.text(`Email: ${user.email}`);
                doc.text(`Mobile No: ${user.mobile}`);
                doc.text(`Role: ${user.isAdmin ? 'Admin' : 'User'}`);
                doc.text(`Status: ${user.blocked ? 'Blocked' : 'Active'}`);
                doc.moveDown();
            });

            doc.end();
        } else if (format === 'csv') {
             // Generate CSV content
             let csvContent = 'Name,Email,Mobile No,Role,Status\n'; // CSV header
             users.forEach(user => {
                 csvContent += `${user.name},${user.email},${user.mobile},${user.isAdmin ? 'Admin' : 'User'},${user.blocked ? 'Blocked' : 'Active'}\n`;
             });
 
             // Set response headers for CSV download
             res.setHeader('Content-Type', 'text/csv');
             res.setHeader('Content-Disposition', 'attachment; filename=user-list.csv');
             res.send(csvContent);
        } else {
            res.status(400).json({ success: false, message: 'Invalid format' });
        }
    } catch (error) {
        console.error('Error generating user list:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/edit-profile/:id', authController.editUser);


module.exports = router;
