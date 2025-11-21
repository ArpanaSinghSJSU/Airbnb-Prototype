const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateJWT, requireOwner } = require('../middleware/jwtAuth');
const { uploadProperty } = require('../middleware/upload');

// Specific routes MUST come before parameterized routes
router.get('/search', propertyController.searchProperties);
router.get('/owner/properties', authenticateJWT, requireOwner, propertyController.getOwnerProperties);

// Parameterized routes (these should come after specific routes)
router.get('/:id', propertyController.getPropertyById);
router.post('/', authenticateJWT, requireOwner, uploadProperty.array('photos', 10), propertyController.createProperty);
router.put('/:id', authenticateJWT, requireOwner, uploadProperty.array('photos', 10), propertyController.updateProperty);
router.delete('/:id', authenticateJWT, requireOwner, propertyController.deleteProperty);
router.post('/:id/photos', authenticateJWT, requireOwner, uploadProperty.array('photos', 10), propertyController.uploadPropertyPhotos);

module.exports = router;
