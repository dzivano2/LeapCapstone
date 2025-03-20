const express = require('express');
const router = express.Router();
const openAIModel = require('../langchainsetup');
const { getUserData } = require('../retriever');
const axios = require('axios');

const conversationMemory = {};

router.post('/chat', async (req, res) => {
    const { userId, message } = req.body;

    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Missing Authorization token' });
        }

        const userData = await getUserData(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!conversationMemory[userId]) {
            conversationMemory[userId] = [];
        }

        if (conversationMemory[userId].length > 10) {
            conversationMemory[userId].shift(); // Keep only the last 10 messages
        }

        conversationMemory[userId].push(`User: ${message}`);

        // ✅ Get venue and queue data, including descriptions
        const { data: allBars } = await axios.get('http://localhost:5001/api/bars/all', {
            headers: { Authorization: token }
        });

        // ✅ Map for quick lookup during follow-ups
        const venueMap = allBars.reduce((map, bar) => {
            map[bar.name.toLowerCase()] = bar;
            return map;
        }, {});

        // ✅ Add descriptions and event details to context
        const venueData = allBars.map(bar => ({
            name: bar.name,
            location: bar.address,
            locationType: bar.locationType || 'Unknown',
            description: bar.description || 'No description available',
            eventDate: bar.eventDate || 'No event date available',
            eventTime: bar.eventTime || 'No event time available'
        }));

        // ✅ Improved intent detection with context
        const intentPrompt = `
            Conversation so far:
            ${conversationMemory[userId].join('\n')}
            Current user message: "${message}"
            
            What is the intent of the last message?
            Options: ["queue_info", "location_info", "event_info", "count", "follow_up", "general"]
            - "follow_up" = A continuation or reference to previous messages
            - Synonyms:
              - "line", "wait", "busy" → queue_info
              - "bar", "venue", "location", "spot" → location_info
              - "how many", "total", "count", "number of" → count
              - "description", "event", "details" → event_info
              - Other questions → general
        `;

        const intentResult = await openAIModel.invoke(intentPrompt);
        const intentMatch = intentResult.content.match(/(queue_info|location_info|event_info|count|follow_up|general)/);
        const intent = intentMatch ? intentMatch[0].trim().toLowerCase() : 'general';

        console.log(`Detected intent: ${intent}`);

        let context = '';

        if (intent === 'queue_info') {
            // ✅ Include queue data
            const barsWithQueue = await Promise.allSettled(
                allBars.map(async (bar) => {
                    try {
                        const { data: queue } = await axios.get(`http://localhost:5001/api/queue/status/${bar._id}`, {
                            headers: { Authorization: token }
                        });

                        return {
                            name: bar.name,
                            queueLength: queue.queueLength || 0
                        };
                    } catch {
                        return {
                            name: bar.name,
                            queueLength: 'No data'
                        };
                    }
                })
            );

            const queueInfo = barsWithQueue
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            context = `Here's the latest queue info:\n\n` +
                queueInfo.map(bar =>
                    `- **${bar.name}**: ${bar.queueLength === 'No data' ? 'Queue info unavailable' : `${bar.queueLength} people in line`}`
                ).join('\n');
        } 
        else if (intent === 'location_info') {
            context = `Leap has the following venues:\n\n` +
                venueData.map(venue => 
                    `- **${venue.name}** (${venue.locationType}) at ${venue.location}`
                ).join('\n');
        } 
        else if (intent === 'event_info') {
            // ✅ Give AI direct access to descriptions and details
            context = `Here are the available events:\n\n` +
                venueData.map(venue =>
                    `- **${venue.name}**: ${venue.description}\n  Date: ${venue.eventDate}\n  Time: ${venue.eventTime}`
                ).join('\n');
        }
        else if (intent === 'count') {
            const totalVenues = allBars.length;
            context = `Leap currently has **${totalVenues} locations**. Let me know if you'd like more details!`;
        } 
        else if (intent === 'follow_up') {
            // ✅ Match last mentioned venue from memory
            const lastMessage = conversationMemory[userId].slice(-2).find(msg => msg.startsWith('User:'));
            const lastVenue = lastMessage ? lastMessage.match(/(barneys|roy concert|waterloo|queens|western|fanshawe)/i) : null;
            const venueName = lastVenue ? lastVenue[0].toLowerCase() : null;

            if (venueName && venueMap[venueName]) {
                const venue = venueMap[venueName];
                context = `
                    Here's what I found about **${venue.name}**:
                    - Location: ${venue.address}
                    - Type: ${venue.locationType}
                    - Event: ${venue.description}
                    - Date: ${venue.eventDate}
                    - Time: ${venue.eventTime}
                `;
            } else {
                context = `Not sure what you're referring to — could you clarify?`;
            }
        } 
        else {
            context = `I’m here to help! You can ask about venues, queue lengths, or event details.`;
        }

        // ✅ Improved prompt with human-like tone
        const finalPrompt = `
            ${context}

            Keep it conversational and human. If data is missing, provide helpful alternatives.
            Make it sound natural — no need to offer pre-defined options unless it makes sense.
            User message: "${message}"
        `;

        const result = await openAIModel.invoke(finalPrompt);

        // ✅ Store AI response in memory
        conversationMemory[userId].push(`AI: ${result.content.trim()}`);

        res.json({ 
            response: result.content.trim()
                .replace(/\*\*/g, '')
                .replace(/(\r\n|\n|\r)/gm, '\n') 
        });

    } catch (error) {
        console.error('Chat Error:', error);

        if (error.response) {
            return res.status(error.response.status).json({ error: error.response.data });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
