const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateJWT, requireTraveler, requireOwner } = require('../middleware/jwtAuth');

// Internal endpoint for AI Agent (no JWT required, uses API key)
router.get('/internal/:id', bookingController.getBookingForAI);

router.post('/', authenticateJWT, requireTraveler, bookingController.createBooking);
router.get('/traveler', authenticateJWT, requireTraveler, bookingController.getTravelerBookings);
router.get('/owner', authenticateJWT, requireOwner, bookingController.getOwnerBookings);
router.put('/:id/accept', authenticateJWT, requireOwner, bookingController.acceptBooking);
router.put('/:id/cancel', authenticateJWT, bookingController.cancelBooking);
router.get('/:id', authenticateJWT, bookingController.getBookingById);

module.exports = router;
