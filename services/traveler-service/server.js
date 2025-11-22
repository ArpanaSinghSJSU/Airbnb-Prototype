require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/utils/db');
const { initProducer } = require('./src/utils/kafka');
const { startBookingStatusConsumer } = require('./src/consumers/bookingStatusConsumer');

const app = express();
const PORT = process.env.TRAVELER_PORT || 3001;

// Connect to MongoDB
connectDB();

// Initialize Kafka (async)
async function initKafka() {
  try {
    console.log('🔄 Initializing Kafka for traveler-service...');
    await initProducer();
    // Start consumer to listen for booking status updates
    await startBookingStatusConsumer();
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

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'traveler-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/traveler', require('./src/routes/travelerRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Traveler Service running on http://localhost:${PORT}`);
});

module.exports = app;

