const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, isTraveler, isOwner } = require('../middleware/auth');

router.post('/', auth, isTraveler, bookingController.createBooking);
router.get('/traveler', auth, isTraveler, bookingController.getTravelerBookings);
router.get('/owner', auth, isOwner, bookingController.getOwnerBookings);
router.put('/:id/accept', auth, isOwner, bookingController.acceptBooking);
router.put('/:id/cancel', auth, bookingController.cancelBooking);
router.get('/:id', auth, bookingController.getBookingById);

module.exports = router;
