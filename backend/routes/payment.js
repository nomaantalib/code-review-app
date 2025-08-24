const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define your User model or import it
const User = require('../models/User'); // Adjust the path as necessary

router.post('/buy-credits', async (req, res) => {
    const { userId, credits } = req.body;

    try {
        // Update user's credits in the database
        await User.findByIdAndUpdate(userId, { $inc: { credits: credits } });
        res.status(200).json({ message: 'Credits added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating credits', error });
    }
});

module.exports = router;
