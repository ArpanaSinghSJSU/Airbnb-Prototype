const { subscribeToTopic, TOPICS } = require('../utils/kafka');
const Booking = require('../models/BookingModel');

/**
 * Handle booking status updates from Kafka
 * @param {object} message - Status update message
 */
async function handleBookingStatusUpdate(message) {
  try {
    console.log('🔄 Processing booking status update:', message.bookingId);

    const {
      bookingId,
      status,
      updatedBy,
      timestamp
    } = message;

    // Update booking status in database
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error(`❌ Booking ${bookingId} not found`);
      return;
    }

    // Update status
    booking.status = status;
    
    // If cancelled, store cancellation info
    if (status === 'CANCELLED') {
      booking.cancelledBy = updatedBy;
      booking.cancelledAt = new Date(timestamp);
    }

    await booking.save();
    console.log(`✅ Booking ${bookingId} status updated to ${status}`);

    // Here you could trigger additional actions:
    // - Send email notification to traveler
    // - Push notification
    // - WebSocket update to frontend
    // - Update analytics/metrics

  } catch (error) {
    console.error('❌ Error processing booking status update:', error.message);
    // In production: implement retry logic, dead letter queue, etc.
  }
}

/**
 * Start the booking status consumer
 */
async function startBookingStatusConsumer() {
  try {
    console.log('🚀 Starting Booking Status Consumer...');
    await subscribeToTopic(TOPICS.BOOKING_STATUS_UPDATES, handleBookingStatusUpdate);
    console.log('✅ Booking Status Consumer is running');
  } catch (error) {
    console.error('❌ Failed to start Booking Status Consumer:', error.message);
    process.exit(1);
  }
}

module.exports = {
  startBookingStatusConsumer,
  handleBookingStatusUpdate
};

