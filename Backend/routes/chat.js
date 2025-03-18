const express = require('express');
const router = express.Router();
const openAIModel = require('../langchainsetup');
const { getUserData } = require('../retriever');
const axios = require('axios');

router.post('/chat', async (req, res) => {
    const { userId, message } = req.body;

    try {
        // ✅ Step 1: Ensure token is present
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Missing Authorization token' });
        }

        // ✅ Step 2: Fetch user data
        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User data:', userData);

        // ✅ Step 3: Ask AI to determine the intent first
        const intentPrompt = `
            Message from user: "${message}"
            What is the intent of this message? 
            Options: ["bar_info", "queue_info", "general"]
            Respond with only the intent value.
        `;

        const intentResult = await openAIModel.invoke(intentPrompt);
        console.log(`Raw intent result: ${intentResult.content}`);

        // ✅ Step 4: Clean up the AI response using regex
        const intentMatch = intentResult.content.match(/(bar_info|queue_info|general)/);
        const intent = intentMatch ? intentMatch[0].trim().toLowerCase() : 'general';

        console.log(`Detected intent: ${intent}`);

        let context = '';

        if (intent === 'bar_info' || intent === 'queue_info') {
            console.log('Fetching all bars...');
            const { data: allBars } = await axios.get('http://localhost:5001/api/bars/all', {
                headers: { Authorization: token }
            });

            console.log('Bars fetched:', allBars.length);

            let filteredBars = [];

            if (intent === 'queue_info') {
                // ✅ Fetch queue data only if intent is queue_info
                const barsWithQueue = await Promise.allSettled(
                    allBars.map(async (bar) => {
                        try {
                            const { data: queue } = await axios.get(`http://localhost:5001/api/queue/status/${bar._id}`, {
                                headers: { Authorization: token }
                            });

                            return {
                                name: bar.name,
                                location: bar.address,
                                queueLength: queue.queueLength || 0
                            };
                        } catch (error) {
                            console.error(`Failed to get queue for bar: ${bar.name} - ${error.message}`);
                            return {
                                name: bar.name,
                                location: bar.address,
                                queueLength: 'No data'
                            };
                        }
                    })
                );

                // ✅ Clean up and filter out failed results
                filteredBars = barsWithQueue
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value);

                context = `
                    Available bars with queue info:
                    ${filteredBars.map(bar =>
                        `- ${bar.name} (${bar.queueLength} people in line)`
                    ).join('\n')}
                `;
            } else if (intent === 'bar_info') {
                // ✅ Just list bars without queue data
                filteredBars = allBars.map(bar => ({
                    name: bar.name,
                    location: bar.address
                }));

                context = `
                    Available bars:
                    ${filteredBars.map(bar =>
                        `- ${bar.name} (${bar.location})`
                    ).join('\n')}
                `;
            }
        } else {
            console.log('General query - No bar/queue data needed.');
            context = '';
        }

        // ✅ Step 6: Format AI context
        const finalContext = `
            ${context}

            Message: ${message}
        `;

        console.log('AI context:', finalContext);

        // ✅ Step 7: Call AI model with context
        const result = await openAIModel.invoke(finalContext);

        // ✅ Step 8: Return AI result to client
        res.json({ response: result });

    } catch (error) {
        console.error('Chat Error:', error);

        // ✅ Handle Axios-specific errors
        if (error.response) {
            return res.status(error.response.status).json({ error: error.response.data });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
