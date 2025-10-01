const Blog = require('../models/Blog');

exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            description,
            author,
            date,
            metatitle,
            metadescription,
            category,
            highlightsTitle,
            highlightsPoints,
            moredetails
        } = req.body;

        let imageUrl = null;
        if (req.file && req.file.path) {
            imageUrl = req.file.path;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        // Handle highlightsPoints: if it's a stringified array, parse it
        let parsedHighlightsPoints = [];
        if (Array.isArray(highlightsPoints)) {
            parsedHighlightsPoints = highlightsPoints;
        } else if (typeof highlightsPoints === 'string' && highlightsPoints.length > 0) {
            try {
                // Try to parse as JSON array
                const maybeArray = JSON.parse(highlightsPoints);
                if (Array.isArray(maybeArray)) {
                    parsedHighlightsPoints = maybeArray;
                } else {
                    parsedHighlightsPoints = [highlightsPoints];
                }
            } catch (e) {
                // Not a JSON array, treat as single string
                parsedHighlightsPoints = [highlightsPoints];
            }
        }

        const newBlog = new Blog({
            title,
            description,
            author,
            date,
            metatitle,
            metadescription,
            category,
            highlightsTitle,
            highlightsPoints: parsedHighlightsPoints,
            moredetails,
            image: imageUrl
        });

        await newBlog.save();
        res.redirect('/admin-blogs');
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
};

exports.editBlog = async (req, res) => {
  
    try {
        const { id } = req.params;
        const {
            title,
            description,
            author,
            date,
            metatitle,
            metadescription,
            category,
            highlightsTitle,
            highlightsPoints,
            moredetails
        } = req.body;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        let imageUrl = blog.image;
        if (req.file && req.file.path) {
            imageUrl = req.file.path;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        // Handle highlightsPoints: if it's a stringified array, parse it
        let parsedHighlightsPoints = [];
        if (Array.isArray(highlightsPoints)) {
            parsedHighlightsPoints = highlightsPoints;
        } else if (typeof highlightsPoints === 'string' && highlightsPoints.length > 0) {
            try {
                // Try to parse as JSON array
                const maybeArray = JSON.parse(highlightsPoints);
                if (Array.isArray(maybeArray)) {
                    parsedHighlightsPoints = maybeArray;
                } else {
                    parsedHighlightsPoints = [highlightsPoints];
                }
            } catch (e) {
                // Not a JSON array, treat as single string
                parsedHighlightsPoints = [highlightsPoints];
            }
        }

        const updatedData = {
            title,
            description,
            author,
            date,
            metatitle,
            metadescription,
            category,
            highlightsTitle,
            highlightsPoints: parsedHighlightsPoints,
            moredetails,
            image: imageUrl
        };

        await Blog.findByIdAndUpdate(id, updatedData, { new: true });
        res.redirect('/admin-blogs');
    } catch (error) {
        res.status(500).json({ message: 'Error updating blog', error: error.message });
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};



exports.deleteBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findByIdAndDelete(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Error deleting blog', message: err.message });
    }
};
