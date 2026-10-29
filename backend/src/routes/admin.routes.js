const express = require('express');
const router = express.Router();

const requireAdmin = require('../middlewares/adminAuth');

const {
  login,
  getMe,
  logout,
  getOrders,
  updateOrderStatus,
  getBookings,
  updateBookingStatus,
} = require('../controllers/admin.controller');

router.post('/login', login);
router.get('/me', getMe);
router.post('/logout', requireAdmin, logout);

router.get('/orders', requireAdmin, getOrders);
router.patch('/orders/:id/status', requireAdmin, updateOrderStatus);

router.get('/bookings', requireAdmin, getBookings);
router.patch('/bookings/:id/status', requireAdmin, updateBookingStatus);

module.exports = router;