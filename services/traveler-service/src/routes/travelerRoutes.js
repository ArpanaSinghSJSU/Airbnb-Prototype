const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');
const { authenticateJWT, requireTraveler } = require('../middleware/jwtAuth');
const { uploadProfile } = require('../middleware/upload');

router.use(authenticateJWT);
router.use(requireTraveler);

router.get('/profile', travelerController.getProfile);
router.put('/profile', travelerController.updateProfile);
router.post('/profile/picture', uploadProfile.single('profile_picture'), travelerController.uploadProfilePicture);
router.get('/history', travelerController.getHistory);
router.get('/bookings', travelerController.getBookings);

module.exports = router;

