const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { auth, isOwner } = require('../middleware/auth');
const { uploadProperty } = require('../middleware/upload');

// Specific routes MUST come before parameterized routes
router.get('/search', propertyController.searchProperties);
router.get('/owner/properties', auth, isOwner, propertyController.getOwnerProperties);

// Parameterized routes (these should come after specific routes)
router.get('/:id', propertyController.getPropertyById);
router.post('/', auth, isOwner, uploadProperty.array('photos', 10), propertyController.createProperty);
router.put('/:id', auth, isOwner, uploadProperty.array('photos', 10), propertyController.updateProperty);
router.delete('/:id', auth, isOwner, propertyController.deleteProperty);
router.post('/:id/photos', auth, isOwner, uploadProperty.array('photos', 10), propertyController.uploadPropertyPhotos);

module.exports = router;
