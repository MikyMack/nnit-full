const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const attemptController = require("../controllers/attemptController");
const couponController = require("../controllers/couponController");
const Attempt=require("../models/Attempt");
const Assessment=require("../models/Assessment");
const Course=require("../models/Course");
const User=require("../models/User");
const jwt=require("jsonwebtoken");

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post("/createAssessment", assessmentController.createAssessment); 
router.get("/getAssessments", assessmentController.getAssessments);
router.get("/getAssessmentById/:id", assessmentController.getAssessmentById);
router.put("/updateAssessment/:id", assessmentController.updateAssessment);
router.delete("/deleteAssessment/:id", assessmentController.deleteAssessment);

router.post("/applyCoupon", couponController.applyCoupon);
router.post("/createCoupon", couponController.createCoupon);
router.get("/getCoupons", couponController.getCoupons);
router.patch("/toggleCoupon/:id", couponController.toggleCoupon);


router.post("/start", attemptController.startAttempt);
router.post("/submit", attemptController.submitAttempt);
router.get("/:id/result", attemptController.getResult);


// Helper: send mail async
async function sendMail({ to, subject, html }) {
    try {
        await transporter.sendMail({
            from: `"IIMF Academy" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
    } catch (err) {
        console.error("Email send error:", err);
    }
}

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

        // Send catchy email to candidate on test start
        if (user.email) {
            const subject = `🚀 Your Assessment "${assessment.title}" Has Begun!`;
            const html = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                    <h2 style="color:#007bff;">Welcome, ${user.name || 'Candidate'}!</h2>
                    <p>We're excited to see you take the next step in your learning journey with the <strong>${assessment.title}</strong> assessment.</p>
                    <p>Give it your best shot and unlock new opportunities!</p>
                    <ul>
                        <li>Stay focused and manage your time wisely.</li>
                        <li>Remember, every question is a chance to shine!</li>
                    </ul>
                    <p style="margin-top:20px;">Good luck!<br><strong>The IIMF Academy Team</strong></p>
                    <hr>
                    <small style="color:#888;">You started this assessment on ${new Date().toLocaleString()}.</small>
                </div>
            `;
            sendMail({ to: user.email, subject, html });
        }

        // Redirect to take assessment
        res.redirect('/take-assessment/' + newAttempt._id);

    } catch (error) {
        console.error("Start Assessment Error:", error);
        res.status(500).render('error', { 
            message: 'Internal server error' 
        });
    }
});

router.get('/take-assessment/:attemptId', async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.attemptId)
            .populate('assessment')
            .populate('answers.question')
            .populate('user');

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
        const courseCategories = await Course.getCategoriesWithCount();
        res.render('take-assessment', {
            title: assessment.title,
            assessment,
            attempt,
            courseCategories,
            user: attempt.user, // send user too
        });

    } catch (error) {
        console.error("Take Assessment Error:", error);
        res.status(500).render('error', { 
            message: 'Internal server error' 
        });
    }
});

router.get('/result/:attemptId', async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.attemptId)
            .populate({
                path: 'assessment',
                populate: { path: 'questions.question' }
            })
            .populate('answers.question')
            .populate('user')
            .lean();

        if (!attempt) {
            return res.status(404).render('error', { 
                message: 'Result not found' 
            });
        }

        const courseCategories = await Course.getCategoriesWithCount();

        const assessment = attempt.assessment;
        const answers = attempt.answers || [];
        const totalQuestions = assessment && assessment.questions ? assessment.questions.length : 0;
        let correct = 0, incorrect = 0, unanswered = 0;
        let questionAnalysis = [];
        let categoryStats = {};

        const answerMap = {};
        answers.forEach(ans => {
            if (ans.question) {
                answerMap[String(ans.question._id)] = ans;
            }
        });

        if (assessment && assessment.questions) {
            assessment.questions.forEach((qObj, idx) => {
                const q = qObj.question || qObj;
                const ans = answerMap[String(q._id)];
                let selected = null, isCorrect = false;
                let category = (q.category && typeof q.category === 'string' && q.category.trim()) ? q.category.trim() : 'Uncategorized';

                if (!categoryStats[category]) {
                    categoryStats[category] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
                }
                categoryStats[category].total++;

                if (ans) {
                    selected = ans.selected;
                    isCorrect = ans.isCorrect;
                    if (isCorrect) {
                        correct++;
                        categoryStats[category].correct++;
                    } else {
                        incorrect++;
                        categoryStats[category].incorrect++;
                    }
                } else {
                    unanswered++;
                    categoryStats[category].unanswered++;
                }

                const optionsForDisplay = q.options ? q.options.map((text, index) => ({
                    text: text,
                    index: index
                })) : [];

                questionAnalysis.push({
                    index: idx + 1,
                    questionText: q.questionText,
                    options: optionsForDisplay,
                    selected: selected,
                    isCorrect: isCorrect,
                    correctOption: q.correctAnswer,
                    category: q.category || null,
                    explanation: q.explanation || null
                });
            });
        }

        const graphData = {
            correct: correct,
            incorrect: incorrect,
            unanswered: unanswered,
            total: totalQuestions
        };

        const categoryAnalysis = Object.entries(categoryStats).map(([cat, stats]) => {
            const percent = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            return {
                category: cat,
                total: stats.total,
                correct: stats.correct,
                incorrect: stats.incorrect,
                unanswered: stats.unanswered,
                percentage: percent
            };
        });

        let relatedCourses = [];
        if (assessment && assessment.category) {
            relatedCourses = await Course.find({
                category: assessment.category,
                isactive: true
            })
            .select('title description category image specialization courseInformation.duration')
            .limit(4)
            .lean();
        }

        if (relatedCourses.length === 0 && categoryAnalysis.length > 0) {
            const weakCategories = categoryAnalysis
                .filter(cat => cat.percentage < 60)
                .map(cat => cat.category);

            if (weakCategories.length > 0) {
                relatedCourses = await Course.find({
                    category: { $in: weakCategories },
                    isactive: true
                })
                .select('title description category image specialization courseInformation.duration')
                .limit(4)
                .lean();
            }
        }

        if (relatedCourses.length === 0) {
            relatedCourses = await Course.find({ isactive: true })
                .select('title description category image specialization courseInformation.duration')
                .limit(4)
                .lean();
        }

        let analysisMessage = "";
        const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
        
        if (percentage >= 80) {
            analysisMessage = "Excellent work! You have a strong understanding of the material.";
        } else if (percentage >= 60) {
            analysisMessage = "Good job! You have a solid foundation with some areas to improve.";
        } else if (percentage >= 40) {
            analysisMessage = "You're on the right track. Focus on the areas where you struggled.";
        } else {
            analysisMessage = "Keep practicing! Review the material and try again.";
        }

        const isUnlocked = attempt.isResultUnlocked === undefined ? true : attempt.isResultUnlocked;

        if (attempt.user && attempt.user.email) {
            if (isUnlocked) {
                let performanceMsg = "";
                if (percentage >= 80) {
                    performanceMsg = "🌟 Outstanding! You aced your assessment!";
                } else if (percentage >= 60) {
                    performanceMsg = "👏 Great job! You're building a strong foundation.";
                } else if (percentage >= 40) {
                    performanceMsg = "💪 Keep going! Every step is progress.";
                } else {
                    performanceMsg = "🚀 Don't give up! Every attempt is a step closer to mastery.";
                }
                const subject = `🎉 Assessment Completed: "${assessment.title}" - Your Results Are In!`;
                const html = `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                        <h2 style="color:#28a745;">Congratulations, ${attempt.user.name || 'Candidate'}!</h2>
                        <p>You have successfully completed the <strong>${assessment.title}</strong> assessment.</p>
                        <p style="font-size:1.1em;">${performanceMsg}</p>
                        <ul>
                            <li><strong>Score:</strong> ${correct} / ${totalQuestions}</li>
                            <li><strong>Accuracy:</strong> ${percentage.toFixed(1)}%</li>
                        </ul>
                        <p>Want to improve further? Check out our recommended courses and keep learning!</p>
                        <a href="https://iimfacademy.com/courses" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Explore Courses</a>
                        <p style="margin-top:20px;">Keep striving for excellence!<br><strong>The IIMF Academy Team</strong></p>
                        <hr>
                        <small style="color:#888;">Assessment completed on ${new Date().toLocaleString()}.</small>
                    </div>
                `;
                sendMail({ to: attempt.user.email, subject, html });
            } else {
                const subject = `🔒 Unlock Your Assessment Result for "${assessment.title}"`;
                const html = `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                        <h2 style="color:#ff9800;">Hi ${attempt.user.name || 'Candidate'},</h2>
                        <p>You've completed the <strong>${assessment.title}</strong> assessment. Your result is ready and waiting for you!</p>
                        <p style="font-size:1.1em;">But wait... it's locked! 🔒</p>
                        <p>Unlock your result now to see your score, detailed analysis, and personalized recommendations to boost your learning journey.</p>
                        <a href="https://iimfacademy.com/result/${attempt._id}" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:4px;">Unlock My Result</a>
                        <p style="margin-top:20px;">Don't miss out on your progress!<br><strong>The IIMF Academy Team</strong></p>
                        <hr>
                        <small style="color:#888;">Assessment completed on ${new Date().toLocaleString()}.</small>
                    </div>
                `;
                sendMail({ to: attempt.user.email, subject, html });
            }
        }

        res.render('result', {
            title: 'Assessment Result',
            attempt: attempt,
            score: attempt.score,
            total: totalQuestions,
            courseCategories: courseCategories,
            user: attempt.user,
            graphData: graphData,
            questionAnalysis: questionAnalysis,
            analysisMessage: analysisMessage,
            categoryAnalysis: categoryAnalysis,
            relatedCourses: relatedCourses
        });

    } catch (error) {
        console.error("Result Error:", error);
        res.status(500).render('error', { 
            message: 'Internal server error' 
        });
    }
});

module.exports = router;
