const Booking = require('../models/BookingModel');
const Property = require('../models/PropertyModel');
const User = require('../models/UserModel');
const { publishMessage, TOPICS } = require('../utils/kafka');

exports.createBooking = async (req, res) => {
  try {
    const travelerId = req.user.userId;
    const { propertyId, checkInDate, checkOutDate, guests, totalPrice, specialRequests } = req.body;

    if (!propertyId || !checkInDate || !checkOutDate || !guests) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    const isAvailable = await Booking.checkAvailability(
      propertyId, 
      new Date(checkInDate), 
      new Date(checkOutDate)
    );
    if (!isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property not available for selected dates' 
      });
    }

    const booking = await Booking.create({
      propertyId,
      travelerId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests: parseInt(guests),
      totalPrice: parseFloat(totalPrice),
      specialRequests
    });

    // ✅ Kafka Integration: Publish booking creation event
    try {
      await publishMessage(TOPICS.OWNER_NOTIFICATIONS, {
        id: `notification-${booking._id}`,
        bookingId: booking._id.toString(),
        propertyId: propertyId,
        travelerId: travelerId,
        eventType: 'BOOKING_CREATED',
        timestamp: new Date().toISOString(),
        message: 'New booking request received',
        bookingDetails: {
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          guests: booking.guests,
          totalPrice: booking.totalPrice
        }
      });
      console.log(`✅ Kafka: Published BOOKING_CREATED event for ${booking._id}`);
    } catch (kafkaError) {
      console.error('⚠️ Kafka publish error (non-blocking):', kafkaError.message);
      // Don't fail the request if Kafka fails - booking is already created
    }

    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

exports.getTravelerBookings = async (req, res) => {
  try {
    const travelerId = req.user.userId;
    const bookings = await Booking.findByTraveler(travelerId);

    res.json({ 
      success: true, 
      bookings
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
    const ownerId = req.user.userId;
    const bookings = await Booking.findByOwner(ownerId);

    res.json({ 
      success: true, 
      bookings
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
    const ownerId = req.user.userId;

    const booking = await Booking.findById(id).populate('propertyId');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.propertyId.ownerId.toString() !== ownerId) {
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

    // Check availability, excluding the current booking from the check
    const isAvailable = await Booking.checkAvailability(
      booking.propertyId._id,
      booking.checkInDate,
      booking.checkOutDate,
      booking._id // Exclude current booking
    );

    if (!isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property no longer available for these dates' 
      });
    }

    await booking.accept();

    // ✅ Kafka Integration: Publish status update event
    try {
      await publishMessage(TOPICS.BOOKING_STATUS_UPDATES, {
        id: `status-${booking._id}-${Date.now()}`,
        bookingId: booking._id.toString(),
        status: 'ACCEPTED',
        updatedBy: 'owner',
        ownerId: ownerId,
        timestamp: new Date().toISOString(),
        message: 'Booking has been accepted'
      });
      console.log(`✅ Kafka: Published BOOKING_ACCEPTED event for ${booking._id}`);
    } catch (kafkaError) {
      console.error('⚠️ Kafka publish error (non-blocking):', kafkaError.message);
    }

    res.json({ 
      success: true, 
      message: 'Booking accepted successfully',
      booking 
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
    const userId = req.user.userId;
    const userRole = req.user.role;

    const booking = await Booking.findById(id).populate('propertyId');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (userRole === 'traveler' && booking.travelerId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (userRole === 'owner') {
      if (booking.propertyId.ownerId.toString() !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
    }

    const { reason } = req.body;
    await booking.cancel(userRole, reason);

    // ✅ Kafka Integration: Publish status update event
    try {
      await publishMessage(TOPICS.BOOKING_STATUS_UPDATES, {
        id: `status-${booking._id}-${Date.now()}`,
        bookingId: booking._id.toString(),
        status: 'CANCELLED',
        updatedBy: userRole,
        userId: userId,
        timestamp: new Date().toISOString(),
        reason: reason,
        message: `Booking cancelled by ${userRole}`
      });
      console.log(`✅ Kafka: Published BOOKING_CANCELLED event for ${booking._id}`);
    } catch (kafkaError) {
      console.error('⚠️ Kafka publish error (non-blocking):', kafkaError.message);
    }

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking 
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
    const booking = await Booking.findById(id)
      .populate('propertyId')
      .populate('travelerId', 'firstName lastName email profilePicture');

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

// Internal endpoint for AI Agent - no JWT required, uses API key
exports.getBookingForAI = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simple API key check for internal services
    const apiKey = req.headers['x-internal-api-key'] || req.headers['x-api-key'];
    const expectedKey = process.env.INTERNAL_API_KEY || 'ai-agent-internal-key-2024';
    
    if (apiKey !== expectedKey) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Invalid API key' 
      });
    }

    const booking = await Booking.findById(id)
      .populate('propertyId');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Format response for AI agent with cleaner data structure
    const response = {
      _id: booking._id,
      id: booking._id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guests: booking.guests,
      status: booking.status,
      totalPrice: booking.totalPrice,
      property: booking.propertyId ? {
        _id: booking.propertyId._id,
        name: booking.propertyId.name,
        type: booking.propertyId.propertyType,
        address: booking.propertyId.address,
        city: booking.propertyId.city,
        state: booking.propertyId.state,
        country: booking.propertyId.country,
        zipcode: booking.propertyId.zipcode,
        amenities: booking.propertyId.amenities,
        pricePerNight: booking.propertyId.pricePerNight
      } : null,
      traveler: {
        _id: booking.travelerId,
        name: 'Traveler'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get booking for AI error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
