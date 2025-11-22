const { subscribeToTopic, TOPICS } = require('../utils/kafka');

/**
 * Handle owner notifications from Kafka
 * @param {object} message - Notification message
 */
async function handleOwnerNotification(message) {
  try {
    console.log('🔔 Processing owner notification:', message.id);

    const {
      bookingId,
      propertyId,
      travelerId,
      eventType,
      timestamp,
      message: notificationMessage
    } = message;

    // Here you can implement various notification actions:
    // - Send email to property owner
    // - Push notification
    // - WebSocket update to owner dashboard
    // - Store notification in database for owner inbox
    // - Update analytics/metrics

    console.log(`📬 Notification for property ${propertyId}:`);
    console.log(`   Type: ${eventType}`);
    console.log(`   Booking: ${bookingId}`);
    console.log(`   Message: ${notificationMessage}`);

    // Example: Log notification (in production, send email or push notification)
    console.log(`✅ Owner notification processed for booking ${bookingId}`);

    // TODO: Implement actual notification delivery (email, SMS, push, etc.)
    // await sendEmailToOwner(propertyId, notificationMessage);
    // await sendPushNotification(propertyId, notificationMessage);

  } catch (error) {
    console.error('❌ Error processing owner notification:', error.message);
    // In production: implement retry logic, dead letter queue, etc.
  }
}

/**
 * Start the owner notification consumer
 */
async function startOwnerNotificationConsumer() {
  try {
    console.log('🚀 Starting Owner Notification Consumer...');
    await subscribeToTopic(TOPICS.OWNER_NOTIFICATIONS, handleOwnerNotification);
    console.log('✅ Owner Notification Consumer is running');
  } catch (error) {
    console.error('❌ Failed to start Owner Notification Consumer:', error.message);
    process.exit(1);
  }
}

module.exports = {
  startOwnerNotificationConsumer,
  handleOwnerNotification
};

