// controllers/contactController.js
const Contact = require("../models/contact");
const transporter = require("../utils/mailer");

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Save in DB
    const newContact = new Contact({ name, email, phone, subject, message });
    await newContact.save();

    // Send email
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: `New Contact Submission: ${subject || "No subject"}`,
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.status(201).json({ success: true, message: "Contact form submitted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error submitting contact form", error: err.message });
  }
};

exports.markReplied = async (req, res) => {
    try {
      const { id } = req.params;
  
      const contact = await Contact.findById(id);
      if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
  
      contact.isReplied = true;
      await contact.save();
  
      res.json({ success: true, message: "Contact marked as replied", contact });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating contact", error: err.message });
    }
  };
