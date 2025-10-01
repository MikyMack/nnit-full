const Testimonial = require('../models/Testimonial');

// Create 
exports.createTestimonial = async (req, res) => {
    try {

        const { title, stars, description } = req.body;

        if (!title || !stars || !description) {
            return res.status(400).json({ message: 'Title, stars, and description are required.' });
        }


        const starsInt = parseInt(stars, 10);
        if (isNaN(starsInt) || starsInt < 1 || starsInt > 5) {
            return res.status(400).json({ message: 'Stars value must be an integer between 1 and 5.' });
        }

        let profilePicUrl = null;
        if (req.file && req.file.path) {
            profilePicUrl = req.file.path;
        } else {
            return res.status(400).json({ message: 'Profile picture is required.' });
        }

        const newTestimonial = new Testimonial({
            title: title.trim(),
            stars: starsInt,
            description: description.trim(),
            profilePic: profilePicUrl,
        });

        await newTestimonial.save();

        res.redirect('/admin-testimonials');
    } catch (error) {
        return res.status(500).json({ message: 'Error creating testimonial', error: error.message });
    }
};

// Get all Testimonials
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching testimonials', error: error.message });
    }
};

// Edit a Testimonial
exports.editTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, stars, description } = req.body;

        // Validate stars
        if (stars && (stars < 1 || stars > 5)) {
            return res.status(400).json({ message: 'Stars value must be between 1 and 5.' });
        }

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        // Use new Cloudinary image if uploaded, otherwise keep old
        let profilePicUrl = testimonial.profilePic;
        if (req.file && req.file.path) {
            profilePicUrl = req.file.path;
        }

        const updatedData = {
            title,
            stars,
            description,
            profilePic: profilePicUrl
        };

        await Testimonial.findByIdAndUpdate(id, updatedData, { new: true });

        res.redirect('/admin-testimonials');
    } catch (error) {
        res.status(500).json({ message: 'Error updating testimonial', error: error.message });
    }
};

// Toggle Testimonial (Enable/Disable)
exports.toggleTestimonial = async (req, res) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        testimonial.toggled = !testimonial.toggled;
        await testimonial.save();

        res.status(200).json({ message: 'Testimonial toggled successfully!', testimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling testimonial', error: error.message });
    }
};

// Delete a Testimonial
exports.deleteTestimonial = async (req, res) => {
    const { id } = req.params;
    try {
        const testimonial = await Testimonial.findByIdAndDelete(id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        // No local file deletion needed, as images are stored in Cloudinary

        return res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Error deleting testimonial', message: err.message });
    }
};
