const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const Event = require('../models/Event');
const Job = require('../models/Job');
const StudyAbroad = require('../models/StudyAbroad');
const Testimonial = require('../models/Testimonial');

router.get('/', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const [
            courses,
            courseCategories,
            events,
            testimonials,
            blogs
        ] = await Promise.all([
            Course.find({ isactive: true }).sort({ createdAt: -1 }).limit(6),
            Course.getCategoriesWithCount(),
            Event.find({ isActive: true }).sort({ createdAt: -1 }).limit(3),
            Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10),
            Blog.find().sort({ createdAt: -1 }).limit(3)
        ]);

        res.render('index', {
            title: 'Home',
            user,
            courses,
            courseCategories, 
            events,
            testimonials,
            blogs
        });

    } catch (error) {
        console.error("Error loading home page:", error);

        res.render('index', {
            title: 'Home',
            user: null,
            courses: [],
            courseCategories: [],
            events: [],
            testimonials: [],
            blogs: []
        });
    }
});


router.get('/user-login', async (req, res) => {
    try {
        res.render('userLogin', { title: 'Login page' });
    } catch (error) {
        res.status(500).send('Error loading login page');
    }
});
router.get('/user-register', async (req, res) => {
    try {
        res.render('userRegister', { title: 'Register page' });
    } catch (error) {
        res.status(500).send('Error loading register page');
    }
});
router.get('/otp-page', async (req, res) => {
    try {
        res.render('userOtp', { title: 'Otp page' });
    } catch (error) {
        res.status(500).send('Error loading otp page');
    }
});

router.get("/forgot-password", (req, res) => {
    res.render("forgot-password");
});
router.get("/reset-password", (req, res) => {
    res.render("resetPassword");
});




// About Page
router.get('/about', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        res.render('about', { title: 'About Us', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('about', { title: 'About Us', user: null, courseCategories: [], testimonials: [] });
    }
});
// About Page



// Contact Page
router.get('/school-campus', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);
        res.render('school-campus', { title: 'school-campus', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('school-campus', { title: 'school-campus', user: null, courseCategories: [], testimonials: [] });
    }
});
router.get('/studyAbroad', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const search = req.query.search ? req.query.search.trim() : '';
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = 9;

        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const totalStudyAbroad = await StudyAbroad.countDocuments(query);

        const studyAbroad = await StudyAbroad.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10)

        const courseCategories = await Course.getCategoriesWithCount();

        const totalPages = Math.ceil(totalStudyAbroad / limit);

        res.render('studyAbroad', {
            title: 'studyAbroad',
            user,
            courseCategories,
            studyAbroad,
            search,
            pagination: {
                total: totalStudyAbroad,
                page,
                totalPages,
                limit
            },
            testimonials
        });
    } catch (error) {
        console.error("Error loading studyAbroad page:", error);
        res.status(500).render('studyAbroad', {
            title: 'studyAbroad',
            user: null,
            courseCategories: [],
            studyAbroad: [],
            search: '',
            pagination: {
                total: 0,
                page: 1,
                totalPages: 1,
                limit: 9
            },
            testimonials:[]
        });
    }
});
router.get('/courses', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const search = req.query.search ? req.query.search.trim() : '';
        const category = req.query.category ? req.query.category.trim() : '';
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = 9; 

        let query = { isactive: true };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }

        const totalCourses = await Course.countDocuments(query);

        const courses = await Course.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const courseCategories = await Course.getCategoriesWithCount();

        const totalPages = Math.ceil(totalCourses / limit);

        res.render('courses', {
            title: 'courses',
            user,
            courses,
            courseCategories,
            currentCategory: category,
            search,
            pagination: {
                total: totalCourses,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        console.error("Error loading courses page:", error);
        res.status(500).render('courses', {
            title: 'courses',
            user: null,
            courses: [],
            courseCategories: [],
            currentCategory: '',
            search: '',
            pagination: {
                total: 0,
                page: 1,
                totalPages: 1,
                limit: 6
            }
        });
    }
});
router.get('/gallery', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        res.render('gallery', { title: 'gallery', user });
    } catch (error) {
        res.status(500).render('gallery', { title: 'gallery', user: null });
    }
});

router.get('/campus-corporates', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);
        res.render('campus-corporates', { title: 'Services', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('campus-corporates', { title: 'Services', user: null, courseCategories: [], testimonials: [] });
    }
});
router.get('/career', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        // Get all unique job categories for the filter dropdown
        const jobCategories = await Job.distinct("category", { isActive: true });

        // Search and filter logic
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = 8;

        const search = req.query.search ? req.query.search.trim() : '';
        const selectedCategory = req.query.category ? req.query.category.trim() : '';

        let query = { isActive: true };

        if (selectedCategory) {
            query.category = selectedCategory;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { category: searchRegex },
                { location: searchRegex },
                { skills: searchRegex }
            ];
        }

        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit) || 1;

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('career', { 
            title: 'Find Jobs', 
            user, 
            courseCategories, 
            testimonials, 
            jobs,
            jobCategories,
            currentCategory: selectedCategory,
            search,
            pagination: {
                total: totalJobs,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        res.status(500).render('career', { 
            title: 'Find Jobs', 
            user: null, 
            courseCategories: [], 
            testimonials: [],
            jobs: [],
            jobCategories: [],
            currentCategory: '',
            search: '',
            pagination: {
                total: 0,
                page: 1,
                totalPages: 1,
                limit: 8
            }
        });
    }
});
router.get('/corporates', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);
        res.render('corporates', { title: 'Services', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('corporates', { title: 'Services', user: null, courseCategories: [], testimonials: [] });
    }
});
router.get('/course-details/:title', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        const courseTitle = req.params.title;
        const course = await Course.findOne({ title: { $regex: new RegExp('^' + courseTitle + '$', 'i') } });

        if (!course) {
            return res.status(404).render('course-details', { 
                title: 'Course Not Found', 
                user, 
                course: null 
            });
        }

        res.render('course-details', { 
            title: course.title || 'Course Details', 
            user, 
            course,
            courseCategories,
            testimonials
        });
    } catch (error) {
        res.status(500).render('course-details', { 
            title: 'Course Details', 
            user: null, 
            course: null,
            courseCategories: [],
            testimonials: []
        });
    }
});


router.get('/events/:title', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        // Find the event by title (case-insensitive)
        const eventTitle = req.params.title;
        const event = await Event.findOne({ title: { $regex: new RegExp('^' + eventTitle + '$', 'i') } });

        // Find upcoming events (excluding the current one)
        const upcomingevents = await Event.find({
            isActive: true,
            _id: { $ne: event ? event._id : undefined }
        })
        .sort({ date: 1 })
        .limit(5);

        if (!event) {
            return res.status(404).render('event-details', {
                title: 'Event Not Found',
                user,
                event: null,
                courseCategories,
                testimonials,
                upcomingevents: []
            });
        }

        res.render('event-details', {
            title: event.title || 'Event Details',
            user,
            event,
            courseCategories,
            testimonials,
            upcomingevents
        });
    } catch (error) {
        res.status(500).render('event-details', {
            title: 'Event Details',
            user: null,
            event: null,
            courseCategories: [],
            testimonials: [],
            upcomingevents: []
        });
    }
});

router.get('/assesment', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        res.render('assesment', { title: 'Services', user });
    } catch (error) {
        res.status(500).render('assesment', { title: 'Services', user: null });
    }
});
router.get('/ielts-pte', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        res.render('ielts-pte', { 
            title: 'ielts-pte', 
            user, 
            courseCategories, 
            testimonials 
        });
    } catch (error) {
        res.status(500).render('ielts-pte', { 
            title: 'ielts-pte', 
            user: null, 
            courseCategories: [], 
            testimonials: [] 
        });
    }
});
router.get('/languageTraining', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);
        res.render('languageTraining', { title: 'languageTraining', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('languageTraining', { title: 'languageTraining', user: null, courseCategories: [], testimonials: [] });
    }
});
router.get('/profile', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        res.render('profile', { title: 'profile', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('profile', { title: 'profile', user: null, courseCategories: [], testimonials: [] });
    }
});
router.get('/blogs', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        // Category filter logic
        const category = req.query.category ? decodeURIComponent(req.query.category) : null;
        let blogQuery = {};
        if (category) {
            blogQuery.category = category;
        }

        // Pagination logic
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9;
        const skip = (page - 1) * limit;

        const [blogs, totalBlogs] = await Promise.all([
            Blog.find(blogQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Blog.countDocuments(blogQuery)
        ]);

        const totalPages = Math.ceil(totalBlogs / limit);

        res.render('blogs', {
            title: 'Blogs',
            user,
            blogs,
            courseCategories,
            testimonials,
            selectedCategory: category,
            pagination: {
                total: totalBlogs,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        let blogs = [];
        let totalBlogs = 0;
        let category = req.query.category ? decodeURIComponent(req.query.category) : null;
        let blogQuery = {};
        if (category) {
            blogQuery.category = category;
        }
        try {
            blogs = await Blog.find(blogQuery).sort({ createdAt: -1 }).limit(9);
            totalBlogs = await Blog.countDocuments(blogQuery);
        } catch (err) {
            // ignore
        }
        res.status(500).render('blogs', {
            title: 'Blogs',
            user: null,
            blogs,
            courseCategories: [],
            testimonials: [],
            selectedCategory: category,
            pagination: {
                total: totalBlogs,
                page: 1,
                totalPages: Math.ceil(totalBlogs / 9) || 1,
                limit: 9
            }
        });
    }
});

// Blog Details Page
router.get('/blog-details/:title', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const blogTitle = decodeURIComponent(req.params.title);

        const blog = await Blog.findOne({ title: blogTitle });
        if (!blog) {
            return res.status(404).render('404', { title: 'Blog Not Found', user });
        }

        let relatedBlogs = [];
        if (blog.category) {
            relatedBlogs = await Blog.find({
                category: blog.category,
                _id: { $ne: blog._id }
            })
            .sort({ createdAt: -1 })
            .limit(3);
        }

        res.render('blog-details', { 
            title: blog.title, 
            user, 
            blog, 
            courseCategories, 
            relatedBlogs
        });
    } catch (error) {
        let blog = null;
        let relatedBlogs = [];
        try {
            const blogTitle = decodeURIComponent(req.params.title);
            blog = await Blog.findOne({ title: blogTitle });
            if (blog && blog.category) {
                relatedBlogs = await Blog.find({
                    category: blog.category,
                    _id: { $ne: blog._id }
                })
                .sort({ createdAt: -1 })
                .limit(3);
            }
        } catch (err) {
            // ignore
        }
        res.status(500).render('blog-details', { 
            title: 'Blog Details', 
            user: null, 
            blog, 
            courseCategories: [], 
            relatedBlogs
        });
    }
});

// Contact Page
router.get('/contact', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);

                user = await User.findById(decoded.id);
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }
        const courseCategories = await Course.getCategoriesWithCount();
        const testimonials = await Testimonial.find({ toggled: true }).sort({ createdAt: -1 }).limit(10);

        res.render('contact', { title: 'Contact Us', user, courseCategories, testimonials });
    } catch (error) {
        res.status(500).render('contact', { title: 'Contact Us', user: null, courseCategories: [], testimonials: [] });
    }
});


router.post("/payu/failure", (req, res) => {
    res.render("failure");
});

module.exports = router;
