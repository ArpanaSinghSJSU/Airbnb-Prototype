const { Kafka, logLevel } = require('kafkajs');

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'owner-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Topics
const TOPICS = {
  BOOKING_REQUESTS: 'booking-requests',
  BOOKING_STATUS_UPDATES: 'booking-status-updates',
  OWNER_NOTIFICATIONS: 'owner-notifications'
};

// Producer instance
let producer = null;

// Consumer instance
let consumer = null;

/**
 * Initialize Kafka Producer
 */
async function initProducer() {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    console.log('✅ Kafka Producer connected (owner-service)');
  }
  return producer;
}

/**
 * Initialize Kafka Consumer
 */
async function initConsumer(groupId = 'owner-service-group') {
  if (!consumer) {
    consumer = kafka.consumer({ groupId });
    await consumer.connect();
    console.log(`✅ Kafka Consumer connected (${groupId})`);
  }
  return consumer;
}

/**
 * Publish message to a topic
 * @param {string} topic - Topic name
 * @param {object} message - Message payload
 */
async function publishMessage(topic, message) {
  try {
    if (!producer) {
      await initProducer();
    }

    const result = await producer.send({
      topic,
      messages: [
        {
          key: message.id || Date.now().toString(),
          value: JSON.stringify(message),
          timestamp: Date.now().toString()
        }
      ]
    });

    console.log(`📤 Published to ${topic}:`, message.id || 'unknown');
    return result;
  } catch (error) {
    console.error(`❌ Error publishing to ${topic}:`, error.message);
    throw error;
  }
}

/**
 * Subscribe to a topic and handle messages
 * @param {string} topic - Topic to subscribe to
 * @param {function} messageHandler - Function to handle each message
 */
async function subscribeToTopic(topic, messageHandler) {
  try {
    if (!consumer) {
      await initConsumer();
    }

    await consumer.subscribe({ topic, fromBeginning: false });
    console.log(`📥 Subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value.toString());
          console.log(`📩 Received message from ${topic}:`, value.id || 'unknown');
          await messageHandler(value);
        } catch (error) {
          console.error(`❌ Error processing message from ${topic}:`, error.message);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error subscribing to ${topic}:`, error.message);
    throw error;
  }
}

/**
 * Disconnect Kafka clients
 */
async function disconnect() {
  try {
    if (producer) {
      await producer.disconnect();
      console.log('✅ Kafka Producer disconnected');
    }
    if (consumer) {
      await consumer.disconnect();
      console.log('✅ Kafka Consumer disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting Kafka:', error.message);
  }
}

// Graceful shutdown
process.on('SIGTERM', disconnect);
process.on('SIGINT', disconnect);

module.exports = {
  TOPICS,
  initProducer,
  initConsumer,
  publishMessage,
  subscribeToTopic,
  disconnect
};

