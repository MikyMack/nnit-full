const express = require('express');
const app = express();
const authMiddleware = require('../middleware/auth'); 
const authController =require('../controllers/authController')
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Testimonial = require('../models/Testimonial');
const Blogs = require('../models/Blog');
const Users = require('../models/User');
const Course = require('../models/Course');
const Gallery = require('../models/Gallery');
const Assessment = require("../models/Assessment");
const Attempt = require("../models/Attempt");
const Coupon = require("../models/Coupon");
const Event = require("../models/Event");
const Job = require("../models/Job");
const contact = require('../models/contact');
const StudyAbroad = require('../models/StudyAbroad');



// Admin Login Page
app.get('/login', (req, res) => {
    res.render('admin-login', { title: 'Admin Login' });
});
app.get('/logout', authController.logout);




app.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filters
        const filter = {};
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: 'i' };
        }

        const categories = await Course.getAllCategories();

        const courses = await Course.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCourses = await Course.countDocuments(filter);
      
        res.render('admin-dashboard', {
            title: 'Admin Dashboard',
            courses,
            categories,
            currentPage: page,
            totalPages: Math.ceil(totalCourses / limit),
            totalCourses,
            selectedCategory: req.query.category || 'all',
            searchQuery: req.query.search || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('errorPage', { title: 'Error', message: 'Error retrieving courses' });
    }
});

// Manage banners (Protected Route)
app.get('/admin-banner', authMiddleware, async (req, res) => {
    try {
        const banners = await Banner.find();
        res.render('admin-banner', { title: 'Manage Banners', banners }); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving banners' });
    }
});
app.get('/admin-assesment', authMiddleware, async (req, res) => {
    try {
      const assessments = await Assessment.find().populate("questions.question").lean();
      const attempts = await Attempt.find()
        .populate("assessment")
        .populate({
          path: "user",
          select: "name email mobile"
        })
        .lean();
      const coupons = await Coupon.find().lean();
  
      res.render('admin-assesment', { 
        title: 'Manage Assessments',
        assessments,
        attempts,
        coupons,
        user: req.user
      }); 
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving assessments' });
    }
  });


app.get('/admin-edit-banner/:id', authMiddleware, async (req, res) => {
    try {
        const bannerId = req.params.id; 
        const banner = await Banner.findById(bannerId); 
        if (!banner) {
            return res.status(404).send('Banner not found');
        }
        res.render('admin-edit-banner', { title: 'Edit Banner', banner }); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving banner' });
    }
});
app.get('/admin-add-banner', authMiddleware, (req, res) => {
    res.render('admin-add-banner', { title: 'Manage Banners' });
});


// manage proucts 
app.get('/admin-gallery', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const [gallery, total] = await Promise.all([
            Gallery.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Gallery.countDocuments()
        ]);

        const totalPages = Math.ceil(total / limit);

        res.render('admin-gallery', { 
            title: 'Manage gallery',
            gallery,
            currentPage: page,
            totalPages,
            totalItems: total
        }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// manage categories 
app.get('/admin-events', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Event.countDocuments()
        ]);

        const totalPages = Math.ceil(total / limit);

        res.render('admin-events', {
            title: 'Events',
            events,
            currentPage: page,
            totalPages,
            totalItems: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/admin-new-category', authMiddleware, (req, res) => {
    res.render('admin-new-category', { title: 'Manage categories' });
});
app.get('/admin-edit-category/:id', authMiddleware, async (req, res) => {
    try {
        const categoryId = req.params.id; 
        const category = await Category.findById(categoryId); 
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('admin-edit-category', {
            title: 'Edit Category',
            category
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// manage clients 

// manage testimonials 
app.get('/admin-testimonials', authMiddleware, async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.render('admin-testimonial', { title: 'Manage testimonials', testimonials });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// manage blogs 
app.get('/admin-blogs', authMiddleware, async (req, res) => {
    try {
        const blogs = await Blogs.find();
        res.render('admin-blogs', { title: 'Manage testimonials', blogs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/admin-edit-blog/:id', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blogs.findById(blogId);
        if (!blog) {
            return res.status(404).send('blog not found');
        }
        res.render('admin-edit-blog', {
            title: 'Edit blogs',
            blog
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/admin-add-blogs', authMiddleware, (req, res) => {
    res.render('admin-add-blogs', { title: 'Manage blogs' });
});

app.get('/admin-users', authMiddleware, async (req, res) => {
    try {
        const users = await Users.find();
        res.render('admin-users', { title: 'Manage users', users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/admin-block-user/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.blocked = true;
        await user.save();
        res.redirect('/admin-users');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/admin-new-users', authMiddleware, (req, res) => {
    res.render('admin-new-users', { title: 'Manage user' });
});

app.get('/admin-careers', authMiddleware, async (req, res) => {
    try {
        const jobs = await Job.find();
        res.render('admin-career', {
            title: 'Admin Careers',
            Job: jobs
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.render('admin-career', {
            title: 'Admin Careers', 
            Job: []
        });
    }
});
app.get('/admin-forms', authMiddleware, async (req, res) => {
    try {
        const Forms = await contact.find();
        res.render('admin-forms', {
            title: 'admin-forms',
            forms: Forms
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.render('admin-forms', {
            title: 'admin-forms', 
            forms: []
        });
    }
});
app.get('/admin-studyAbroad', authMiddleware, async (req, res) => {
    try {
        const studyAbroad = await StudyAbroad.find();
        res.render('admin-studyAbroad', {
            title: 'admin-studyAbroad',
            studyAbroads : studyAbroad
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.render('admin-studyAbroad', {
            title: 'admin-studyAbroad', 
            studyAbroads : []
        });
    }
});

app.locals.getFilterQueryString = function() {
    let queryString = '';
    if (this.employeeSearchValue) queryString += `&employeeNameOrId=${encodeURIComponent(this.employeeSearchValue)}`;
    if (this.startDateValue) queryString += `&startDate=${encodeURIComponent(this.startDateValue)}`;
    if (this.endDateValue) queryString += `&endDate=${encodeURIComponent(this.endDateValue)}`;
    return queryString;
};



module.exports = app;
