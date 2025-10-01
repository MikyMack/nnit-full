const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { upload } = require("../config/cloudinary");

router.get('/', galleryController.getAllGallery);

router.post('/', upload.single('image'), galleryController.createGallery);

router.put('/:id', upload.single('image'), galleryController.editGallery);

router.delete('/:id', galleryController.deleteGallery);

module.exports = router;
