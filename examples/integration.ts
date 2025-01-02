import createRagApplication from './rag';
import createChatbot from './chatbot';
import createAgent from './agent';

async function main() {
  // Initialize components
  const rag = await createRagApplication();
  const chatbot = await createChatbot();
  const agent = await createAgent();

  // Example: AI Assistant with RAG and Agent capabilities
  async function handleUserQuery(query: string) {
    try {
      // 1. Check if query requires agent actions
      if (query.toLowerCase().includes('can you help me') || 
          query.toLowerCase().includes('please do')) {
        return await agent.think(query);
      }

      // 2. Use RAG for knowledge-based queries
      if (query.endsWith('?') || query.toLowerCase().includes('what') || 
          query.toLowerCase().includes('how')) {
        return await rag.queryKnowledgeBase(query);
      }

      // 3. Default to chatbot for conversation
      return await chatbot.chat(query);

    } catch (error) {
      console.error('Error handling query:', error);
      return 'I encountered an error processing your request.';
    }
  }

  return {
    handleUserQuery,
    rag,
    chatbot,
    agent
  };
}

export default main;

// Usage example:
/*
async function example() {
  const assistant = await main();
  
  // Query the knowledge base
  const answer = await assistant.handleUserQuery(
    "What are the key features of SimpletonAI?"
  );
  
  // Use the agent for a task
  const result = await assistant.handleUserQuery(
    "Can you help me analyze this dataset and create a summary?"
  );
  
  // Have a conversation
  const response = await assistant.handleUserQuery(
    "That's interesting! Tell me more about it."
  );
}
*/
