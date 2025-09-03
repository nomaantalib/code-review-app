const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Define your User model or import it
const User = require('../src/models/User');

// Initialize Razorpay instance (only if credentials are available)
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully');
  } else {
    console.warn('Razorpay credentials not found. Payment functionality will be limited.');
  }
} catch (error) {
  console.error('Failed to initialize Razorpay:', error.message);
}

// Credit packages configuration
const CREDIT_PACKAGES = {
  100: 20000, // 200 INR in paise
  500: 100000, // 1000 INR in paise
  1000: 200000 // 2000 INR in paise
};

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { userId, credits } = req.body;

  if (!CREDIT_PACKAGES[credits]) {
    return res.status(400).json({ message: 'Invalid credit package' });
  }

  // Check if Razorpay is initialized
  if (!razorpay) {
    console.error('Razorpay not initialized - credentials missing');
    return res.status(503).json({
      message: 'Payment service temporarily unavailable. Please use UPI payment method.',
      error: 'Razorpay not configured',
      suggestion: 'Please contact support or use UPI payment'
    });
  }

  try {
    const amount = CREDIT_PACKAGES[credits];

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('Razorpay order created successfully:', order.id);

    // Save payment record to user
    await User.findByIdAndUpdate(userId, {
      $push: {
        paymentHistory: {
          amount: amount / 100, // Convert back to INR
          credits: credits,
          paymentMethod: 'razorpay',
          transactionId: order.id,
          status: 'pending'
        }
      }
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', {
      statusCode: error.statusCode,
      error: error.error,
      message: error.message
    });

    // Check if it's an authentication error
    if (error.statusCode === 401 || error.error?.code === 'BAD_REQUEST_ERROR') {
      console.error('Razorpay authentication failed - invalid credentials');
      return res.status(503).json({
        message: 'Payment service authentication failed. Please use UPI payment method.',
        error: 'Razorpay authentication error',
        suggestion: 'Please contact support to configure payment gateway or use UPI payment'
      });
    }

    res.status(500).json({
      message: 'Error creating order',
      error: error.message,
      suggestion: 'Please try UPI payment method'
    });
  }
});

// Verify Razorpay payment with improved error handling and logging
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, credits } = req.body;

  console.log('🔍 Payment verification started:', {
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    userId: userId,
    credits: credits
  });

  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      console.error('Razorpay not initialized during verification');
      return res.status(503).json({ 
        message: 'Payment service not configured. Please contact support.',
        error: 'Razorpay not initialized',
        transactionId: razorpay_order_id
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found during payment verification:', userId);
      return res.status(404).json({ 
        message: 'User account not found. Please contact support.',
        error: 'User not found',
        transactionId: razorpay_order_id
      });
    }

    // Determine if we're in test mode
    const isTestMode = !process.env.RAZORPAY_KEY_SECRET || 
                      process.env.RAZORPAY_KEY_SECRET.includes('test') ||
                      process.env.RAZORPAY_KEY_SECRET.includes('TEST');
    
    console.log('Payment verification mode:', isTestMode ? 'TEST' : 'PRODUCTION');

    if (!isTestMode) {
      // Production signature verification
      if (!razorpay_signature) {
        console.error('Missing razorpay_signature in production mode');
        return res.status(400).json({ 
          message: 'Payment verification failed: Missing signature',
          error: 'Signature missing',
          transactionId: razorpay_order_id
        });
      }

      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      console.log('Signature comparison:', {
        generated: generated_signature,
        received: razorpay_signature,
        match: generated_signature === razorpay_signature
      });

      if (generated_signature !== razorpay_signature) {
        console.error('Signature verification failed:', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          generatedSignature: generated_signature,
          receivedSignature: razorpay_signature
        });
        return res.status(400).json({ 
          message: 'Payment verification failed: Invalid signature',
          error: 'Signature mismatch',
          transactionId: razorpay_order_id,
          supportContact: 'Please contact support with transaction details'
        });
      }
    } else {
      console.log('Test mode: Skipping signature verification');
    }

    // Validate credits parameter
    if (!credits || !CREDIT_PACKAGES[credits]) {
      console.error('Invalid credits package:', credits);
      return res.status(400).json({ 
        message: 'Invalid credit package selected',
        error: 'Invalid credits',
        transactionId: razorpay_order_id,
        availablePackages: Object.keys(CREDIT_PACKAGES)
      });
    }

    const creditsToAdd = parseInt(credits);
    const amountPaid = CREDIT_PACKAGES[creditsToAdd] / 100; // Convert paise to INR

    console.log('Updating user credits:', {
      userId: userId,
      currentCredits: user.credits,
      creditsToAdd: creditsToAdd,
      newBalance: user.credits + creditsToAdd,
      amountPaid: amountPaid
    });

    // Update user credits and add to payment history
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { credits: creditsToAdd },
        $push: {
          paymentHistory: {
            amount: amountPaid,
            credits: creditsToAdd,
            paymentMethod: 'razorpay',
            transactionId: razorpay_payment_id || razorpay_order_id,
            status: 'completed',
            verifiedAt: new Date()
          }
        }
      },
      { new: true } // Return the updated document
    );

    console.log('✅ Payment verified successfully:', {
      userId: userId,
      creditsAdded: creditsToAdd,
      newBalance: updatedUser.credits,
      transactionId: razorpay_payment_id || razorpay_order_id
    });

    res.status(200).json({ 
      message: 'Payment verified successfully!', 
      creditsAdded: creditsToAdd,
      newBalance: updatedUser.credits,
      transactionId: razorpay_payment_id || razorpay_order_id
    });
  } catch (error) {
    console.error('❌ Payment verification error:', {
      error: error.message,
      stack: error.stack,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId: userId
    });
    res.status(500).json({ 
      message: 'Error verifying payment. Please contact support.', 
      error: error.message,
      transactionId: razorpay_order_id,
      supportContact: 'Please contact support with your transaction ID and payment details'
    });
  }
});

// UPI Payment endpoint
router.post('/upi-payment', async (req, res) => {
  const { userId, credits } = req.body;
  
  if (!CREDIT_PACKAGES[credits]) {
    return res.status(400).json({ message: 'Invalid credit package' });
  }

  try {
    const amount = CREDIT_PACKAGES[credits] / 100; // Convert to INR
    
    // Get UPI ID from environment or use default
    const upiId = process.env.UPI_ID || '7068604832@ybl';
    const accountNumber = process.env.ACCOUNT_NUMBER || '4786001500132366';
    const accountHolder = process.env.ACCOUNT_HOLDER_NAME || 'Code Review AI';
    
    if (!upiId || !accountNumber || !accountHolder) {
      return res.status(500).json({ message: 'Payment configuration incomplete. Please contact support.' });
    }

    const transactionId = `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save payment record
    await User.findByIdAndUpdate(userId, {
      $push: {
        paymentHistory: {
          amount: amount,
          credits: credits,
          paymentMethod: 'upi',
          transactionId: transactionId,
          status: 'pending',
          upiId: upiId
        }
      }
    });

    // Generate UPI payment URL
    const upiPaymentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountHolder)}&am=${amount}&tn=${transactionId}&cu=INR`;
    
    // Generate QR code for the UPI payment
    let qrCodeDataUrl;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(upiPaymentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (qrError) {
      console.warn('QR code generation failed:', qrError.message);
      qrCodeDataUrl = null;
    }

    // Return UPI payment details with QR code
    res.status(200).json({
      message: 'UPI payment initiated',
      upiDetails: {
        upiId: upiId,
        accountNumber: accountNumber,
        accountHolder: accountHolder,
        amount: amount,
        transactionId: transactionId,
        merchantName: 'Code Review AI',
        ifscCode: process.env.IFSC_CODE || 'Please contact support for IFSC code'
      },
      paymentUrl: upiPaymentUrl,
      qrCode: qrCodeDataUrl,
      instructions: [
        '1. Scan the QR code using any UPI app',
        '2. Or copy the UPI ID and make payment manually',
        '3. After payment, click "Verify Payment" to confirm',
        '4. Payments are processed manually within 24 hours'
      ]
    });
  } catch (error) {
    console.error('UPI payment error:', error);
    res.status(500).json({ 
      message: 'Error processing UPI payment', 
      error: error.message,
      supportContact: 'Please contact support if the issue persists'
    });
  }
});

// Manual payment verification (for UPI/bank transfers - improved)
router.post('/verify-manual-payment', async (req, res) => {
  const { userId, transactionId, credits } = req.body;

  console.log('🔍 Manual payment verification started:', {
    userId: userId,
    transactionId: transactionId,
    credits: credits
  });

  try {
    // Validate required parameters
    if (!userId || !transactionId || !credits) {
      console.error('Missing required parameters:', { userId, transactionId, credits });
      return res.status(400).json({
        message: 'Missing required parameters: userId, transactionId, and credits are required',
        error: 'Missing parameters'
      });
    }

    // Validate credits parameter against available packages
    if (!CREDIT_PACKAGES[credits]) {
      console.error('Invalid credits package:', credits);
      return res.status(400).json({
        message: 'Invalid credit package selected',
        error: 'Invalid credits',
        availablePackages: Object.keys(CREDIT_PACKAGES)
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if transaction already exists to prevent duplicate verification
    const existingTransaction = user.paymentHistory.find(
      payment => payment.transactionId === transactionId && payment.status === 'completed'
    );

    if (existingTransaction) {
      console.warn('Transaction already verified:', transactionId);
      return res.status(409).json({
        message: 'This transaction has already been verified',
        error: 'Duplicate verification',
        transactionId: transactionId
      });
    }

    // Add credits to user account based on selected package
    const creditsToAdd = parseInt(credits);
    const amountPaid = CREDIT_PACKAGES[creditsToAdd] / 100; // Convert paise to INR
    const newBalance = (user.credits || 0) + creditsToAdd;

    console.log('Adding credits to user:', {
      userId: userId,
      creditsToAdd: creditsToAdd,
      amountPaid: amountPaid,
      newBalance: newBalance
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { credits: creditsToAdd },
      $push: {
        paymentHistory: {
          amount: amountPaid,
          credits: creditsToAdd,
          paymentMethod: 'upi',
          transactionId: transactionId,
          status: 'completed',
          verifiedAt: new Date()
        }
      }
    });

    console.log('✅ Manual payment verified successfully:', {
      userId: userId,
      creditsAdded: creditsToAdd,
      newBalance: newBalance,
      transactionId: transactionId
    });

    res.status(200).json({
      message: 'Payment verified successfully',
      creditsAdded: creditsToAdd,
      newBalance: newBalance,
      transactionId: transactionId
    });
  } catch (error) {
    console.error('❌ Manual payment verification error:', {
      error: error.message,
      stack: error.stack,
      userId: userId,
      transactionId: transactionId,
      credits: credits
    });
    res.status(500).json({
      message: 'Error verifying payment',
      error: error.message,
      supportContact: 'Please contact support with transaction details'
    });
  }
});

// Get user payment history
router.get('/history/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('paymentHistory');
    res.status(200).json(user.paymentHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment history', error });
  }
});

module.exports = router;
