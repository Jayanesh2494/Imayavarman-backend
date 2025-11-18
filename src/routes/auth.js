const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// Routes
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
