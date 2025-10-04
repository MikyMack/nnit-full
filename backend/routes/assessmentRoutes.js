const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const attemptController = require("../controllers/attemptController");
const couponController = require("../controllers/couponController");
const Attempt=require("../models/Attempt");
const Assessment=require("../models/Assessment");
const User=require("../models/User");
const jwt=require("jsonwebtoken");

router.post("/createAssessment", assessmentController.createAssessment); 
router.get("/getAssessments", assessmentController.getAssessments);
router.get("/getAssessmentById/:id", assessmentController.getAssessmentById);
router.put("/updateAssessment/:id", assessmentController.updateAssessment);
router.post("/start", attemptController.startAttempt);
router.post("/submit", attemptController.submitAttempt);
router.get("/:id/result", attemptController.getResult);
router.post("/applyCoupon", couponController.applyCoupon);
router.post("/createCoupon", couponController.createCoupon);
router.get("/getCoupons", couponController.getCoupons);
router.patch("/toggleCoupon/:id", couponController.toggleCoupon);

router.get('/start/:assessmentId', async (req, res) => {
    try {
        const token = req.cookies.token;
        let user = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.SESSION_SECRET);
                user = await User.findById(decoded.id).lean();
            } catch (err) {
                console.error("JWT Verification Error:", err);
            }
        }

        // Redirect to login if not authenticated
        if (!user) {
            return res.redirect('/login?redirect=/start/' + req.params.assessmentId);
        }

        const assessment = await Assessment.findById(req.params.assessmentId)
            .populate('questions.question')
            .lean();

        if (!assessment) {
            return res.status(404).render('error', { 
                message: 'Assessment not found' 
            });
        }

        // Check if user already attempted
        const existingAttempt = await Attempt.findOne({
            user: user._id,
            assessment: req.params.assessmentId
        });

        if (existingAttempt) {
            return res.redirect('/result/' + existingAttempt._id);
        }

        // Create attempt for logged-in user
        const newAttempt = new Attempt({
            user: user._id,
            assessment: req.params.assessmentId,
        });

        await newAttempt.save();

        // Redirect to take assessment
        res.redirect('/take-assessment/' + newAttempt._id);

    } catch (error) {
        console.error("Start Assessment Error:", error);
        res.status(500).render('error', { 
            message: 'Internal server error' 
        });
    }
});

// Route to take assessment
router.get('/take-assessment/:attemptId', async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.attemptId)
            .populate('assessment')
            .populate('answers.question');

        if (!attempt) {
            return res.status(404).render('error', { 
                message: 'Attempt not found' 
            });
        }

        // If already submitted, redirect to result
        if (attempt.answers && attempt.answers.length > 0) {
            return res.redirect('/result/' + attempt._id);
        }

        const assessment = await Assessment.findById(attempt.assessment)
            .populate('questions.question')
            .lean();

        res.render('take-assessment', {
            title: assessment.title,
            assessment,
            attempt
        });

    } catch (error) {
        console.error("Take Assessment Error:", error);
        res.status(500).render('error', { 
            message: 'Internal server error' 
        });
    }
});

// Route to view result (with unlock options)
router.get('/result/:attemptId', async (req, res) => {
    console.log(req.body);
    
    try {
        const attempt = await Attempt.findById(req.params.attemptId)
            .populate('assessment')
            .populate('answers.question')
            .lean();

        if (!attempt) {
            return res.status(404).render('error', { 
                message: 'Result not found' 
            });
        }

        res.render('result', {
            title: 'Assessment Result',
            attempt,
            score: attempt.score,
            total: attempt.answers ? attempt.answers.length : 0
        });

    } catch (error) {
        console.error("Result Error:", error);
        res.status(500).render('error', { 
            message: 'Internal server error' 
        });
    }
});

module.exports = router;
