const Event = require("../models/Event");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Event
exports.createEvent = async (req, res) => {

  try {
    const {
      title, seats, tag, description, highlights,
      moreDetails, venue, email, number, isActive
    } = req.body;

    // Accept date fields as either dateFrom/dateTo or date[from]/date[to]
    let dateFrom = req.body.dateFrom || (req.body.date && req.body.date.from);
    let dateTo = req.body.dateTo || (req.body.date && req.body.date.to);

    // Validate required date fields
    if (!dateFrom || !dateTo) {
      return res.status(400).json({ success: false, message: "Both date.from and date.to are required." });
    }

    // Upload images to Cloudinary
    const images = [];
    if (req.files) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "events" });
        images.push(result.secure_url);
      }
    }

    if (images.length > 3) return res.status(400).json({ message: "Maximum 3 images allowed" });

    let highlightsArr = [];
    if (highlights) {
      if (Array.isArray(highlights)) {
        highlightsArr = highlights;
      } else if (typeof highlights === "string") {
        try {
          const parsed = JSON.parse(highlights);
          if (Array.isArray(parsed)) {
            highlightsArr = parsed;
          } else {
            highlightsArr = highlights.split(",").map(h => h.trim()).filter(Boolean);
          }
        } catch (e) {
          // Not valid JSON, treat as comma separated
          highlightsArr = highlights.split(",").map(h => h.trim()).filter(Boolean);
        }
      }
    }

    const newEvent = new Event({
      title,
      images,
      date: { from: dateFrom, to: dateTo },
      seats,
      tag,
      description,
      highlights: highlightsArr,
      moreDetails,
      venue,
      email,
      number,
      isActive: isActive !== undefined ? isActive : true
    });

    await newEvent.save();
    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }).lean();
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle date fields: accept dateFrom/dateTo or date[from]/date[to]
    let dateFrom = req.body.dateFrom || (req.body.date && req.body.date.from);
    let dateTo = req.body.dateTo || (req.body.date && req.body.date.to);

    if (dateFrom || dateTo) {
      updateData.date = {
        from: dateFrom || (updateData.date && updateData.date.from),
        to: dateTo || (updateData.date && updateData.date.to)
      };
      delete updateData.dateFrom;
      delete updateData.dateTo;
    }

    if (updateData.highlights) {
      if (Array.isArray(updateData.highlights)) {
        // do nothing
      } else if (typeof updateData.highlights === "string") {
        try {
          const parsed = JSON.parse(updateData.highlights);
          if (Array.isArray(parsed)) {
            updateData.highlights = parsed;
          } else {
            updateData.highlights = updateData.highlights.split(",").map(h => h.trim()).filter(Boolean);
          }
        } catch (e) {
          updateData.highlights = updateData.highlights.split(",").map(h => h.trim()).filter(Boolean);
        }
      }
    }

    if (req.files && req.files.length > 0) {
      const images = [];
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "events" });
        images.push(result.secure_url);
      }
      updateData.images = images;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle event active status
exports.toggleEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    event.isActive = !event.isActive;
    await event.save();
    res.json({ success: true, isActive: event.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

