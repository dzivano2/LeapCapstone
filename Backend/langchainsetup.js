const { ChatOpenAI } = require('@langchain/openai');



const openAIModel = new ChatOpenAI({
  openAIApiKey: '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', // <-- Your OpenAI API key here
  temperature: 0.7,
});

module.exports = openAIModel;
