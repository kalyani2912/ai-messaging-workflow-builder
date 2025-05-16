// This is a placeholder for your API key - to be replaced by the user
const HUGGINGFACE_API_KEY = "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";

interface HuggingFaceResponse {
  generated_text: string;
}

// Middleware to sanitize AI responses - improved detection logic
export const sanitizeResponse = (response: string): string => {
  // Improved hallucination detection - only block simulated conversations and outcomes
  if (
    response.includes("User:") ||
    response.includes("Assistant:") ||
    /Message (sent|scheduled|delivered)/i.test(response) ||
    response.includes("workflow saved") ||
    response.includes("workflow launched")
  ) {
    return "Please reply to proceed with your workflow setup.";
  }

  // Handle blank or malformed responses
  if (!response || response.trim().length === 0) {
    return "Sorry, something went wrong. Please try again.";
  }

  return response;
};

// Get response from Agent 1 (Zephyr model)
export const getAIResponse = async (systemPrompt: string, userMessage: string): Promise<string> => {
  try {
    const headers = {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const body = {
      inputs: `${systemPrompt}\nUser: ${userMessage}\nAssistant:`,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.5,  // Reduced temperature for more focused responses
        return_full_text: false
      }
    };

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data: HuggingFaceResponse[] = await response.json();
    
    if (!data || !data[0]?.generated_text) {
      return "I'm having trouble. Could you try again?";
    }
    
    // Sanitize the response before returning
    return sanitizeResponse(data[0].generated_text.trim());
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return "Sorry, I encountered an error. Please try again in a moment.";
  }
};

// Get response from Agent 2 (OpenChat model) for workflow visualization
export const getWorkflowVisualization = async (workflowData: WorkflowData): Promise<string> => {
  try {
    const headers = {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const systemPrompt = "Generate a concise, step-by-step workflow visualization based on this JSON data. Format with emojis: 🟢 for triggers, 🟡 for actions, 🔵 for conditions. Keep it short and structured.";
    const userMessage = JSON.stringify(workflowData, null, 2);
    
    const body = {
      inputs: `${systemPrompt}\nWorkflow JSON: ${userMessage}\nVisualization:`,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.2,
        return_full_text: false
      }
    };

    const response = await fetch("https://api-inference.huggingface.co/models/OpenChat/openchat-3.5-0106", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data: HuggingFaceResponse[] = await response.json();
    
    if (!data || !data[0]?.generated_text) {
      return "Unable to generate workflow visualization.";
    }
    
    return data[0].generated_text.trim();
  } catch (error) {
    console.error("Error calling OpenChat API:", error);
    return `🟢 Trigger: Keyword '${workflowData.keyword || "[Pending]"}' on ${workflowData.trigger_channel || "[Pending]"}
${workflowData.message?.content ? `→ 🟡 Action: Send message ${workflowData.message.delay || "immediately"}: '${workflowData.message.content}'` : ""}`;
  }
};

// Function to build the system prompt for Agent 1
export const buildSystemPrompt = (): string => {
  return `You are a messaging workflow builder assistant. Your job is to help users create simple, keyword-triggered messaging automations.

Ask the user ONE QUESTION at a time and WAIT for their response. Your job is to collect the following fields step-by-step:

The keyword that should trigger the workflow (e.g., 'HELP', 'OFFER')
The channel the keyword will be received on (SMS, WhatsApp, Email, Messenger)
The message to send when the keyword is received
Whether the message should be delayed (e.g., "immediate", "after 1 hour")
Whether the user wants to launch the workflow or save it as a draft

CRITICAL RULES:

DO NOT simulate or imagine the user's input.
DO NOT generate example user responses like "User: Yes" or "User: No".
DO NOT simulate outcomes or messages like "Message sent!" or "Workflow saved!" unless the user has explicitly confirmed that action.
DO NOT generate multiple assistant messages in one turn — respond only ONCE per user message.
DO NOT add to or modify the user's message content.
DO NOT assume the user wants personalization, variable injection, or marketing templates unless they ask.
DO NOT suggest product categories or simulate product flows.

Keep your tone professional, minimal, and instructional — not like customer support or marketing.
After each user response, give a short confirmation (e.g., "Got it. We'll send the message via SMS.") and ask the next relevant question.
Limit your responses to 2 short sentences unless more explanation is requested.

Your job is to gather data, not execute the workflow. Once all required inputs are collected, confirm the configuration and inform the user they can choose to launch or save it.`;
};

// Types
export interface WorkflowData {
  keyword: string;
  trigger_channel: string;
  message: {
    content: string;
    delay: string;
  };
  launch_decision: string;
}

// Improved channel input validation with normalization
export const validateChannelInput = (input: string): boolean => {
  const normalizedInput = input.trim().toLowerCase();
  const allowedChannels = ["sms", "whatsapp", "email", "messenger"];
  return allowedChannels.includes(normalizedInput);
};

export const normalizeChannelInput = (input: string): string => {
  const normalizedInput = input.trim().toLowerCase();
  const map: Record<string, string> = {
    "sms": "SMS",
    "whatsapp": "WhatsApp",
    "email": "Email",
    "messenger": "Messenger"
  };
  
  return map[normalizedInput] || input;
};
