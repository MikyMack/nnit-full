const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const attemptController = require("../controllers/attemptController");
const couponController = require("../controllers/couponController");

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

module.exports = router;
