const express = require('express');
const router = express.Router();
const openAIModel = require('../langchainsetup');
const { getUserData } = require('../retriever');
const Queue = require('../models/Queue'); // Ensure path is correct
const Bar = require('../models/Bars'); // Ensure path is correct

router.post('/chat', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const userData = await getUserData(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User data:', userData); // Debugging

    // Handle barId being null or undefined
    const queue = userData.barId ? await Queue.findOne({ barId: userData.barId }) : null;
    const bar = userData.barId ? await Bar.findById(userData.barId) : null;

    const context = `
      User preferences: ${userData.preferences ? JSON.stringify(userData.preferences) : 'No preferences available'}
      Queue status: ${queue ? `${queue.users.length} people in line` : 'No queue data available'}
      Bar details: ${bar ? `Name: ${bar.name}, Location: ${bar.location}` : 'No bar info'}
      Recommended action: Based on the queue and location data, suggest the best option.
      Message: ${message}
    `;

    console.log('Context:', context); // Debugging

    // Call the AI model with context
    const result = await openAIModel.invoke(context);

    res.json({ response: result });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
