const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    author: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    metatitle: {
        type: String,
        required: false
    },
    metadescription: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    highlightsTitle: {
        type: String,
        required: false
    },
    highlightsPoints: {
        type: [String],
        required: false
    },
    moredetails: {
        type: String,
        required: false
    }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
