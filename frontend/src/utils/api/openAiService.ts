
// This is a placeholder for your API key - to be replaced by the user
const OPENAI_API_KEY = "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";

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
}

// Get response from OpenAI model for workflow building
export const getAIResponse = async (systemPrompt: string, userMessage: string, currentContext?: string): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key is missing. Please set your API key.");
      return "API key is missing. Please set your OpenAI API key to continue.";
    }

    const headers = {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    };

    const messages = [
      { role: "system", content: systemPrompt }
    ];
    
    if (currentContext) {
      messages.push({ role: "system", content: `Current step context: ${currentContext}` });
    }
    
    messages.push({ role: "user", content: userMessage });

    const body = {
      model: "gpt-4-1106-preview",
      messages: messages,
      temperature: 0.3,  // Lower temperature for more focused responses
      max_tokens: 250,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      return "I'm having trouble. Could you try again?";
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Sorry, I encountered an error. Please try again in a moment.";
  }
};

// Get response from OpenAI model for workflow visualization
export const getWorkflowVisualization = async (workflowData: import("../types/workflow").WorkflowData): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key is missing. Please set your API key.");
      return "API key is missing. Please set your OpenAI API key to continue.";
    }

    const headers = {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    };

    const systemPrompt = "Generate a concise, step-by-step workflow visualization based on this JSON data. Format with emojis: 🟢 for triggers, 🟡 for actions, 🔵 for conditions. Keep it short and structured.";
    const userMessage = JSON.stringify(workflowData, null, 2);
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];

    const body = {
      model: "gpt-4-1106-preview",
      messages: messages,
      temperature: 0.2,
      max_tokens: 200
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status: ${response.status} - ${errorText}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      return "Unable to generate workflow visualization.";
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return `🟢 Trigger: Keyword '${workflowData.keyword || "[Pending]"}' on ${workflowData.trigger_channel || "[Pending]"}
${workflowData.message?.content ? `→ 🟡 Action: Send message ${workflowData.message.delay || "immediately"}: '${workflowData.message.content}'` : ""}`;
  }
};

// Function to build the system prompt
export const buildSystemPrompt = (): string => {
  return `You are a structured assistant that helps users build messaging automations by asking one question at a time. Start by asking the user to select the type of automation: 1. Keyword Trigger Automation 2. Appointment Reminder. Once the user selects, follow the correct flow for that type. Ask each question in a short, clear sentence. Do not simulate or repeat the user's input. Do not assume or add imaginary confirmations like "User input: ..." or "Automation has been created." Only ask the next question in the setup flow. Your goal is to collect fields like keyword, channel, message, and delay—one step at a time. Recommend adding an opt-out message when collecting user-generated messages.`;
};
