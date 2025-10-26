const Booking = require('../models/Booking');
const Property = require('../models/Property');

exports.createBooking = async (req, res) => {
  try {
    const travelerId = req.session.user.id;
    const { property_id, start_date, end_date, guests, total_price } = req.body;

    if (!property_id || !start_date || !end_date || !guests) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    const isAvailable = await Booking.checkAvailability(property_id, start_date, end_date);
    if (!isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property not available for selected dates' 
      });
    }

    const bookingId = await Booking.create({
      property_id,
      traveler_id: travelerId,
      start_date,
      end_date,
      guests,
      total_price
    });

    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      bookingId 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getTravelerBookings = async (req, res) => {
  try {
    const travelerId = req.session.user.id;
    const bookings = await Booking.findByTravelerId(travelerId);

    res.json({ 
      success: true, 
      bookings: bookings  // Return flat array
    });
  } catch (error) {
    console.error('Get traveler bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.session.user.id;
    const bookings = await Booking.findByOwnerId(ownerId);

    res.json({ 
      success: true, 
      bookings: bookings  // Return flat array
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.session.user.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    const property = await Property.findById(booking.property_id);
    if (property.owner_id !== ownerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending bookings can be accepted' 
      });
    }

    const isAvailable = await Booking.checkAvailability(
      booking.property_id,
      booking.start_date,
      booking.end_date,
      id
    );

    if (!isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property no longer available for these dates' 
      });
    }

    await Booking.updateStatus(id, 'ACCEPTED');

    res.json({ 
      success: true, 
      message: 'Booking accepted successfully' 
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (userRole === 'traveler' && booking.traveler_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (userRole === 'owner') {
      const property = await Property.findById(booking.property_id);
      if (property.owner_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
    }

    await Booking.updateStatus(id, 'CANCELLED');

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({ 
      success: true, 
      booking 
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
