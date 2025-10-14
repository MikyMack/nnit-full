
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, description, category, questions } = req.body;

    if (!title || !category || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Title, category, and questions are required." });
    }
    const formattedQuestions = questions.map(q => {
      const correctIndex = Array.isArray(q.options)
        ? q.options.findIndex(opt => opt === q.correctAnswer)
        : -1;

      if (correctIndex === -1) {
        throw new Error(`Correct answer "${q.correctAnswer}" not found in options for question "${q.text}"`);
      }

      if (!q.category || typeof q.category !== "string" || !q.category.trim()) {
        throw new Error(`Category is required for question "${q.text}"`);
      }

      return {
        questionText: q.text,
        options: q.options,
        correctAnswer: correctIndex,
        category: q.category.trim(),
        explanation: q.explanation || ""
      };
    });

    const createdQuestions = await Question.insertMany(formattedQuestions);

    const assessmentQuestions = createdQuestions.map(q => ({ question: q._id }));

    const assessment = new Assessment({
      title,
      description,
      category,
      questions: assessmentQuestions
    });

    await assessment.save();
    res.status(201).json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an existing assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, questions } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    if (title !== undefined) assessment.title = title;
    if (description !== undefined) assessment.description = description;
    if (category !== undefined) assessment.category = category;

    if (Array.isArray(questions) && questions.length > 0) {
      const oldQuestionIds = assessment.questions.map(q => q.question);
      await Question.deleteMany({ _id: { $in: oldQuestionIds } });

      const formattedQuestions = questions.map(q => {
        const correctIndex = Array.isArray(q.options)
          ? q.options.findIndex(opt => opt === q.correctAnswer)
          : -1;

        if (correctIndex === -1) {
          throw new Error(`Correct answer "${q.correctAnswer}" not found in options for question "${q.text}"`);
        }

        // Each question must have its own category
        if (!q.category || typeof q.category !== "string" || !q.category.trim()) {
          throw new Error(`Category is required for question "${q.text}"`);
        }

        return {
          questionText: q.text,
          options: q.options,
          correctAnswer: correctIndex,
          category: q.category.trim(),
          explanation: q.explanation || ""
        };
      });

      const createdQuestions = await Question.insertMany(formattedQuestions);
      assessment.questions = createdQuestions.map(q => ({ question: q._id }));
    }

    await assessment.save();
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate({
      path: "questions.question",
      select: "questionText options correctAnswer category explanation"
    });
    res.json({ success: true, assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate({
        path: "questions.question",
        select: "questionText options correctAnswer category explanation"
      });
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const questionIds = assessment.questions.map(q => q.question);
    await Question.deleteMany({ _id: { $in: questionIds } });

    // Delete the assessment
    await Assessment.findByIdAndDelete(assessmentId);

    res.json({ success: true, message: "Assessment deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

