require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/utils/db');

const app = express();
const PORT = process.env.BOOKING_PORT || 3004;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'booking-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/bookings', require('./src/routes/bookingRoutes'));

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
  console.log(`🚀 Booking Service running on http://localhost:${PORT}`);
});

module.exports = app;

