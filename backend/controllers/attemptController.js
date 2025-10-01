
const Attempt = require("../models/Attempt");
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");

// Start an attempt (guest or logged-in user)
exports.startAttempt = async (req, res) => {
  try {
    const { assessmentId, guestDetails } = req.body;
    const userId = req.user ? req.user._id : null;

    const newAttempt = new Attempt({
      user: userId,
      guestDetails: userId ? null : guestDetails,
      assessment: assessmentId,
    });

    await newAttempt.save();
    res.status(201).json({ success: true, attempt: newAttempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit answers
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const attempt = await Attempt.findById(attemptId).populate("assessment");

    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

    let score = 0;
    const processedAnswers = [];

    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;

      const isCorrect = ans.selected === question.correctAnswer;
      if (isCorrect) score++;

      processedAnswers.push({
        question: question._id,
        selected: ans.selected,
        isCorrect,
      });
    }

    attempt.answers = processedAnswers;
    attempt.score = score;
    await attempt.save();

    res.json({ success: true, attemptId: attempt._id, message: "Answers submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get result (locked until unlocked)
exports.getResult = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate("answers.question")
      .populate("assessment");

    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

    if (!attempt.isResultUnlocked) {
      return res.status(403).json({ success: false, message: "Result is locked. Please unlock with coupon or payment." });
    }

    res.json({ success: true, score: attempt.score, total: attempt.answers.length, answers: attempt.answers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
