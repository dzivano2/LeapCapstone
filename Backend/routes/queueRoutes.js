const express = require('express');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const Queue = require('../models/Queue');
const User = require('../models/User');
const stripe = require("stripe")("sk_test_51R3l8XQhyzTMJUFhELOVmzsA8yh78P6p5wz1X1k680j6T6o8RQQEObfLXXN6JYpjHjWSqvpnPOHwjm8wRWeE1Rx300kE0bqIqt");
const router = express.Router();
const moment = require('moment-timezone');

let io;

const SOCKET_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5001'
    : 'https://leapbackend.onrender.com';

const initializeSocket = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://leapbackend.onrender.com'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });}

const storeItems= new Map([[
  1,{priceInCents:50, name:'Leap the Line'}
]])

// Get queue status for a specific bar
router.get('/status/:barId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) return res.status(404).json({ msg: 'Queue not found' });

    // EMPLOYEE ACCESS RESTRICTION
    if ((req.user.userType == 'admin') ){

    }
    else if ( (req.user.userType === 'employee' && req.user.barId.toString() !== req.params.barId)) {
      return res.status(403).json({ msg: 'Unauthorized to access this queue' });
    }

    // REGULAR USER ACCESS — Queue must be open
    if ((req.user.userType != 'admin' && req.user.userType !== 'employee') && !queue.isOpen) {
      return res.status(403).json({ msg: 'Queue is closed' });
    }

    res.json({
      isQueueOpen: queue.isOpen,
      queueLength: queue.users.length,
      queue: queue.users,
    });
  } catch (err) {
    console.error('Error getting queue status:', err.message);
    res.status(500).send('Server error');
  }
});
// Remove a user from the queue (Employee only)
router.delete('/:barId/remove-user/:userId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });

    if (!queue) {
      return res.status(404).json({ msg: 'Queue not found' });
    }

    // Employee can only modify their own queue
    if (req.user.userType === 'employee' && req.user.barId.toString() !== req.params.barId) {
      return res.status(403).json({ msg: 'Unauthorized to modify this queue' });
    }

    queue.users = queue.users.filter(
      (user) => user.userId.toString() !== req.params.userId
    );

    await queue.save();

    // Emit real-time update to connected clients
    io.emit('queue-updated', {
      barId: req.params.barId,
      queue: queue.users,
      queueLength: queue.users.length,
    });

    res.json({ msg: 'User removed from queue' });
  } catch (err) {
    console.error('Error removing user from queue:', err.message);
    res.status(500).send('Server error');
  }
});



router.post('/open/:barId', auth, async (req, res) => {
  const { maxQueueLength = 250 } = req.body;

  try {
    // ✅ Prevent access if the bar ID doesn't match the user's assigned bar
    if ((req.user.userType === 'admin') ){

    }
    else if ( (String(req.user.barId) !== String(req.params.barId))) {
      return res.status(403).json({ msg: 'Unauthorized to open this queue' });
    }

    let queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) {
      queue = new Queue({ barId: req.params.barId, isOpen: true, users: [], maxQueueLength });
    } else {
      queue.isOpen = true;
      queue.users = [];
      queue.maxQueueLength = maxQueueLength;
    }
    
    await queue.save();

    io.emit('queue-status', { barId: req.params.barId, isOpen: true, maxQueueLength });
    res.json({ msg: 'Queue opened', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error opening queue:', err.message);
    res.status(500).send('Server error');
  }
});


router.post('/close/:barId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) return res.status(404).json({ msg: 'Queue not found' });

    // ✅ Admins can close any queue
    if (req.user.userType === 'admin') {
      queue.isOpen = false;
      await queue.save();

      io.emit('queue-status', { barId: req.params.barId, isOpen: false });
      return res.json({ msg: 'Queue closed' });
    }

    // ✅ Employees can only close their assigned bar's queue
    if (
      req.user.userType === 'employee' &&
      String(req.user.barId) !== String(req.params.barId)
    ) {
      return res.status(403).json({ msg: 'Unauthorized to close this queue' });
    }

    queue.isOpen = false;
    await queue.save();

    io.emit('queue-status', { barId: req.params.barId, isOpen: false });
    res.json({ msg: 'Queue closed' });
  } catch (err) {
    console.error('Error closing queue:', err.message);
    res.status(500).send('Server error');
  }
});


// Join queue
router.post('/:barId/join', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue || !queue.isOpen) return res.status(400).json({ msg: 'Queue is not open' });

    if (queue.users.find((user) => user.userId.toString() === req.user.id.toString())) {
      return res.status(400).json({ msg: 'User already in queue' });
    }

    if (queue.users.length >= queue.maxQueueLength) {
      return res.status(400).json({ msg: 'Queue is full' });
    }

    const user = await User.findById(req.user.id).select('username');
    queue.users.push({ userId: user._id, name: user.username });
    await queue.save();

    io.emit('queue-updated', { barId: req.params.barId, queue: queue.users, queueLength: queue.users.length });
    res.json({ msg: 'Joined queue', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error joining queue:', err.message);
    res.status(500).send('Server error');
  }
});

// Leave queue
router.post('/:barId/leave', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue || !queue.isOpen) return res.status(400).json({ msg: 'Queue is not open' });

    const userIndex = queue.users.findIndex((user) => user.userId.toString() === req.user.id.toString());
    if (userIndex === -1) {
      return res.status(400).json({ msg: 'User not in queue' });
    }

    queue.users.splice(userIndex, 1); // Remove user from queue
    await queue.save();

    io.emit('queue-updated', { barId: req.params.barId, queue: queue.users, queueLength: queue.users.length });
    res.json({ msg: 'Left queue', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error leaving queue:', err.message);
    res.status(500).send('Server error');
  }
});
router.post('/validateQR', auth, async (req, res) => {
  try {
    const { userId, barId } = req.body;
    if (!userId || !barId) {
      return res.status(400).json({ msg: 'Missing userId or barId in request' });
    }

    const queue = await Queue.findOne({ barId });
    if (!queue) {
      return res.status(400).json({ msg: 'Queue not found for this barId' });
    }

    // Find the user in the queue
    const userInQueue = queue.users.find(user => user.userId.toString() === userId);

    // Fetch the user's profile to check if they have paid
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(400).json({ msg: 'User profile not found' });
    }

    const hasPaidToSkip = userProfile.paid; // Check the `paid` field from the user's profile

    // If the user is not in the queue and hasn't paid, return an error
    if (!userInQueue && !hasPaidToSkip) {
      return res.status(400).json({ msg: 'User not found in the queue and has not paid to skip the line' });
    }

    let message = 'User validated';

    // If the user is in the queue, check if they are first in line
    if (userInQueue) {
      const isFirstInLine = queue.users[0].userId.toString() === userId;

      // Remove the user from the queue if they are first in line
      if (isFirstInLine) {
        queue.users.shift(); // Remove the first user
        await queue.save();
        message += ', removed from queue, and cannot rejoin until 2 AM.';
      }
    } else if (hasPaidToSkip) {
      // If the user is not in the queue but has paid, validate them
      message += ' (paid user).';
    }

    res.json({ msg: message });

    // Emit real-time queue update
    io.emit('queue-updated', { barId, queue: queue.users, queueLength: queue.users.length });
  } catch (error) {
    console.error('Error in validateQR:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId, barId } = req.body; // Add userId and barId to the request body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: 'cad',
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `http://localhost:3000/success?userId=${userId}&barId=${barId}`, // Pass userId and barId
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
  } catch (e) {
    console.error('Error creating checkout session:', e.message);
    res.status(500).json({ error: e.message });
  }
});



router.post('/handle-payment-success', async (req, res) => {
  try {
    const { userId, barId } = req.body;

    // Fetch the user's profile
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(400).json({ msg: 'User profile not found' });
    }

    // Set the `paid` field to true
    userProfile.paid = true;
    console.log(userProfile);
    await userProfile.save();
  } catch (error) {
    console.error('Error in handle-payment-success:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;





module.exports = { router, initializeSocket };
