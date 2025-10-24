const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { auth, isOwner } = require('../middleware/auth');
const { uploadProperty } = require('../middleware/upload');

router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);

router.post('/', auth, isOwner, propertyController.createProperty);
router.get('/owner/properties', auth, isOwner, propertyController.getOwnerProperties);
router.put('/:id', auth, isOwner, propertyController.updateProperty);
router.delete('/:id', auth, isOwner, propertyController.deleteProperty);
router.post('/:id/photos', auth, isOwner, uploadProperty.array('photos', 10), propertyController.uploadPropertyPhotos);

module.exports = router;
