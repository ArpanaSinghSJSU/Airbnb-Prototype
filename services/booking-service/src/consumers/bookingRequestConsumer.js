const { subscribeToTopic, TOPICS } = require('../utils/kafka');
const Booking = require('../models/BookingModel');
const { publishMessage } = require('../utils/kafka');

/**
 * Handle incoming booking requests from Kafka
 * @param {object} message - Booking request message
 */
async function handleBookingRequest(message) {
  try {
    console.log('🔄 Processing booking request:', message.bookingId);

    const {
      bookingId,
      propertyId,
      travelerId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice
    } = message;

    // Check if booking already exists (idempotency)
    const existingBooking = await Booking.findById(bookingId);
    if (existingBooking) {
      console.log(`⚠️  Booking ${bookingId} already exists, skipping...`);
      return;
    }

    // Create booking in database
    const newBooking = new Booking({
      _id: bookingId,
      propertyId,
      travelerId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests,
      totalPrice,
      status: 'PENDING'
    });

    await newBooking.save();
    console.log(`✅ Booking ${bookingId} created successfully`);

    // Publish notification to owner
    await publishMessage(TOPICS.OWNER_NOTIFICATIONS, {
      id: `notification-${bookingId}`,
      bookingId,
      propertyId,
      travelerId,
      eventType: 'BOOKING_CREATED',
      timestamp: new Date().toISOString(),
      message: 'New booking request received'
    });

    console.log(`📤 Owner notification sent for booking ${bookingId}`);
  } catch (error) {
    console.error('❌ Error processing booking request:', error.message);
    // In production: implement retry logic, dead letter queue, etc.
  }
}

/**
 * Start the booking request consumer
 */
async function startBookingRequestConsumer() {
  try {
    console.log('🚀 Starting Booking Request Consumer...');
    await subscribeToTopic(TOPICS.BOOKING_REQUESTS, handleBookingRequest);
    console.log('✅ Booking Request Consumer is running');
  } catch (error) {
    console.error('❌ Failed to start Booking Request Consumer:', error.message);
    process.exit(1);
  }
}

module.exports = {
  startBookingRequestConsumer,
  handleBookingRequest
};

