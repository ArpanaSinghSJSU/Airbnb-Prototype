const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { auth, isOwner } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.use(auth);
router.use(isOwner);

router.get('/profile', ownerController.getProfile);
router.put('/profile', ownerController.updateProfile);
router.post('/profile/picture', uploadProfile.single('profile_picture'), ownerController.uploadProfilePicture);
router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
