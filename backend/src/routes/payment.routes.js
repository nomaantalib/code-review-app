const express = require('express');
const { createOrder, verifyPayment, getPricingPlans } = require('../controllers/payment.controllers');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Create order route
router.post('/create-order', authMiddleware, createOrder);

// Verify payment route
router.post('/verify-payment', authMiddleware, verifyPayment);

// Get pricing plans
router.get('/pricing', getPricingPlans);

module.exports = router;
