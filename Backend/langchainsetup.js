// ✅ Load dotenv first
require('dotenv').config();
const { ChatOpenAI } = require('@langchain/openai');



const openAIModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
});

module.exports = openAIModel;
