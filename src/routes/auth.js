const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', protect, refreshToken);

module.exports = router;
