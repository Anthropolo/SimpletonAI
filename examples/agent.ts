import { OllamaClient } from '../src/lib/ollamaClient';
import { VectorStore } from '../src/lib/vectorStore';

interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

async function createAgent() {
  const ollama = new OllamaClient('http://127.0.0.1:11434');
  const vectorStore = new VectorStore({
    dimension: 768,
    similarity: 'cosine'
  });

  // Define agent's tools
  const tools: Tool[] = [
    {
      name: 'search_knowledge_base',
      description: 'Search for information in the knowledge base',
      execute: async (query: string) => {
        const embedding = await ollama.getEmbedding(query);
        return await vectorStore.search(embedding, 3);
      }
    },
    {
      name: 'calculate',
      description: 'Perform mathematical calculations',
      execute: async (expression: string) => {
        return eval(expression);
      }
    }
  ];

  async function think(task: string) {
    try {
      // 1. Analyze task and determine required tools
      const planningPrompt = `
        Task: ${task}
        Available tools: ${tools.map(t => `${t.name}: ${t.description}`).join('\n')}
        
        What tools should be used and in what order to complete this task?
        Respond in JSON format with a list of steps, each containing tool name and arguments.
      `;

      const plan = JSON.parse(await ollama.generateText(planningPrompt));

      // 2. Execute plan
      const results = [];
      for (const step of plan) {
        const tool = tools.find(t => t.name === step.tool);
        if (tool) {
          const result = await tool.execute(step.args);
          results.push(result);
        }
      }

      // 3. Generate final response
      const responsePrompt = `
        Task: ${task}
        Results from tools: ${JSON.stringify(results)}
        
        Please provide a final response based on the tool results.
      `;

      return await ollama.generateText(responsePrompt);

    } catch (error) {
      console.error('Agent error:', error);
      throw error;
    }
  }

  return {
    think,
    addTool: (tool: Tool) => tools.push(tool)
  };
}

export default createAgent;
