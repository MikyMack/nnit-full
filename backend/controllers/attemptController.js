
const Attempt = require("../models/Attempt");
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");


// Helper: send mail async (should be available in this file or imported)
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
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

exports.startAttempt = async (req, res) => {
  try {
      const { assessmentId, name, email, phone } = req.body;
      
      const guestDetails = {
          name: name,
          email: email,
          phone: phone
      };

      const newAttempt = new Attempt({
          user: null,
          guestDetails: guestDetails,
          assessment: assessmentId,
      });

      await newAttempt.save();

      // Send start mail to guest
      // Fetch assessment title for email
      let assessment = null;
      try {
        assessment = await Assessment.findById(assessmentId);
      } catch (e) {}
      const assessmentTitle = assessment ? assessment.title : "Assessment";

      if (email) {
        const subject = `🚀 Your Assessment "${assessmentTitle}" Has Begun!`;
        const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                <h2 style="color:#007bff;">Welcome, ${name || 'Candidate'}!</h2>
                <p>We're excited to see you take the next step in your learning journey with the <strong>${assessmentTitle}</strong> assessment.</p>
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
        sendMail({ to: email, subject, html });
      }
 
      res.json({ 
        success: true, 
        message: "Assessment started successfully",
        attempt: {
            _id: newAttempt._id,
            assessment: newAttempt.assessment
        }
      });
  } catch (err) {
      console.error("Start Attempt Error:", err);
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

    // Send result mail(s) to guest if email exists
    const guest = attempt.guestDetails || {};
    const email = guest.email;
    const name = guest.name;
    const assessment = attempt.assessment;
    const totalQuestions = processedAnswers.length;
    const correct = score;
    const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    if (email && assessment && assessment.title) {
      // Compose performance message
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

      // Send locked result mail (always, since result is locked by default)
      const lockedSubject = `🔒 Unlock Your Assessment Result for "${assessment.title}"`;
      const lockedHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
            <h2 style="color:#ff9800;">Hi ${name || 'Candidate'},</h2>
            <p>You've completed the <strong>${assessment.title}</strong> assessment. Your result is ready and waiting for you!</p>
            <p style="font-size:1.1em;">But wait... it's locked! 🔒</p>
            <p>Unlock your result now to see your score, detailed analysis, and personalized recommendations to boost your learning journey.</p>
            <a href="https://iimfacademy.com/result/${attempt._id}" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:4px;">Unlock My Result</a>
            <p style="margin-top:20px;">Don't miss out on your progress!<br><strong>The IIMF Academy Team</strong></p>
            <hr>
            <small style="color:#888;">Assessment completed on ${new Date().toLocaleString()}.</small>
        </div>
      `;
      sendMail({ to: email, subject: lockedSubject, html: lockedHtml });

      // If result is unlocked (should not be at this point, but for completeness)
      if (attempt.isResultUnlocked) {
        const unlockedSubject = `🎉 Assessment Completed: "${assessment.title}" - Your Results Are In!`;
        const unlockedHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
              <h2 style="color:#28a745;">Congratulations, ${name || 'Candidate'}!</h2>
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
        sendMail({ to: email, subject: unlockedSubject, html: unlockedHtml });
      }
    }

    res.json({ success: true, attemptId: attempt._id, message: "Answers submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get result (locked until unlocked)
exports.getResult = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: "answers.question",
        select: "questionText options correctAnswer category explanation"
      })
      .populate("assessment");

    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

    if (!attempt.isResultUnlocked) {
      const guest = attempt.guestDetails || {};
      const email = guest.email;
      const name = guest.name;
      const assessment = attempt.assessment;
      if (email && assessment && assessment.title) {
        const lockedSubject = `🔒 Unlock Your Assessment Result for "${assessment.title}"`;
        const lockedHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
              <h2 style="color:#ff9800;">Hi ${name || 'Candidate'},</h2>
              <p>You've completed the <strong>${assessment.title}</strong> assessment. Your result is ready and waiting for you!</p>
              <p style="font-size:1.1em;">But wait... it's locked! 🔒</p>
              <p>Unlock your result now to see your score, detailed analysis, and personalized recommendations to boost your learning journey.</p>
              <a href="https://iimfacademy.com/result/${attempt._id}" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:4px;">Unlock My Result</a>
              <p style="margin-top:20px;">Don't miss out on your progress!<br><strong>The IIMF Academy Team</strong></p>
              <hr>
              <small style="color:#888;">Assessment completed on ${new Date().toLocaleString()}.</small>
          </div>
        `;
        sendMail({ to: email, subject: lockedSubject, html: lockedHtml });
      }
      return res.status(403).json({ success: false, message: "Result is locked. Please unlock with coupon or payment." });
    } else {
      const guest = attempt.guestDetails || {};
      const email = guest.email;
      const name = guest.name;
      const assessment = attempt.assessment;
      const totalQuestions = attempt.answers.length;
      const correct = attempt.score;
      const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
      if (email && assessment && assessment.title) {
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
        const unlockedSubject = `🎉 Assessment Completed: "${assessment.title}" - Your Results Are In!`;
        const unlockedHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
              <h2 style="color:#28a745;">Congratulations, ${name || 'Candidate'}!</h2>
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
        sendMail({ to: email, subject: unlockedSubject, html: unlockedHtml });
      }
    }

    res.json({ success: true, score: attempt.score, total: attempt.answers.length, answers: attempt.answers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
