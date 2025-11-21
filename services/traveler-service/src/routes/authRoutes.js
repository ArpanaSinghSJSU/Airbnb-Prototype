const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/jwtAuth');

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes (require JWT authentication)
router.post('/logout', authenticateJWT, authController.logout);
router.get('/check', authenticateJWT, authController.checkAuth);

module.exports = router;

