
const Coupon = require("../models/Coupon");
const Attempt = require("../models/Attempt");

// Apply coupon to unlock result
exports.applyCoupon = async (req, res) => {
  try {
    const { attemptId, couponCode } = req.body;

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) return res.status(400).json({ success: false, message: "Invalid or inactive coupon" });

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

    attempt.isResultUnlocked = true;
    attempt.unlockMethod = "coupon";
    await attempt.save();

    coupon.usedBy.push(attempt._id);
    await coupon.save();

    res.json({ success: true, message: "Result unlocked with coupon", attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ success: false, message: "Coupon code is required" });
  
      const newCoupon = new Coupon({ code });
      await newCoupon.save();
  
      res.status(201).json({ success: true, coupon: newCoupon });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  // List all coupons
  exports.getCoupons = async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.json({ success: true, coupons });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  // Activate / deactivate coupon
  exports.toggleCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
  
      coupon.isActive = !coupon.isActive;
      await coupon.save();
  
      res.json({ success: true, coupon });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };