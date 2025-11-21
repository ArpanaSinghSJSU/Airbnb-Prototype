const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateJWT, requireOwner } = require('../middleware/jwtAuth');
const { uploadProfile } = require('../middleware/upload');

router.use(authenticateJWT);
router.use(requireOwner);

router.get('/profile', ownerController.getProfile);
router.put('/profile', ownerController.updateProfile);
router.post('/profile/picture', uploadProfile.single('profile_picture'), ownerController.uploadProfilePicture);
router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
