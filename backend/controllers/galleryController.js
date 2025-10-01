const Gallery = require('../models/Gallery');

// Get all gallery items
exports.getAllGallery = async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json(galleryItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

 exports.createGallery = async (req, res) => {

  try {
    const { category, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }
    const imageUrl = req.file.path;

    const newGallery = new Gallery({
      imageUrl,
      category,
      caption,
    });

    await newGallery.save();

    res.redirect('/admin-gallery');
  } catch (err) {
    console.error("Error creating gallery:", err);
    res.status(500).json({ error: err.message });
  }
};

// Edit (update) a gallery item
exports.editGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, caption } = req.body;

    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const updateFields = {};
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (category !== undefined) updateFields.category = category;
    if (caption !== undefined) updateFields.caption = caption;

    const updatedGallery = await Gallery.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedGallery) {
      return res.status(404).json({ error: 'Gallery item not found.' });
    }
    res.redirect('/admin-gallery');
  } catch (err) {
    console.error("Error editing gallery:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a gallery item
exports.deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGallery = await Gallery.findByIdAndDelete(id);
        if (!deletedGallery) {
            return res.status(404).json({ error: 'Gallery item not found.' });
        }
        res.status(200).json({ message: 'Gallery item deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
