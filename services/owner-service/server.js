require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/utils/db');
const { initProducer } = require('./src/utils/kafka');
const { startOwnerNotificationConsumer } = require('./src/consumers/ownerNotificationConsumer');

const app = express();
const PORT = process.env.OWNER_PORT || 3002;

// Connect to MongoDB
connectDB();

// Initialize Kafka (async)
async function initKafka() {
  try {
    console.log('🔄 Initializing Kafka for owner-service...');
    await initProducer();
    // Start consumer to listen for owner notifications
    await startOwnerNotificationConsumer();
    console.log('✅ Kafka initialized successfully');
  } catch (error) {
    console.error('❌ Kafka initialization error:', error.message);
    console.log('⚠️  Service will continue without Kafka');
  }
}

// Start Kafka after a short delay to allow other services to initialize
setTimeout(initKafka, 5000);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/owner-profiles', express.static('uploads/profiles'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'owner-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/owner', require('./src/routes/ownerRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Owner Service running on http://localhost:${PORT}`);
});

module.exports = app;

