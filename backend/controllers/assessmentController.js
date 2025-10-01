
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, description, category, questions } = req.body;

    // Validate required fields
    if (!title || !category || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Title, category, and questions are required." });
    }
    const formattedQuestions = questions.map(q => {
      // Find the index of the correct answer in options
      const correctIndex = Array.isArray(q.options)
        ? q.options.findIndex(opt => opt === q.correctAnswer)
        : -1;

      if (correctIndex === -1) {
        throw new Error(`Correct answer "${q.correctAnswer}" not found in options for question "${q.text}"`);
      }

      return {
        questionText: q.text,
        options: q.options,
        correctAnswer: correctIndex
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

        return {
          questionText: q.text,
          options: q.options,
          correctAnswer: correctIndex
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
    const assessments = await Assessment.find().populate("questions.question");
    res.json({ success: true, assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate("questions.question");
    if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
