const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');
const { auth, isTraveler } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.use(auth);
router.use(isTraveler);

router.get('/profile', travelerController.getProfile);
router.put('/profile', travelerController.updateProfile);
router.post('/profile/picture', uploadProfile.single('profile_picture'), travelerController.uploadProfilePicture);
router.get('/history', travelerController.getHistory);

module.exports = router;
