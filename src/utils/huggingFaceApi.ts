
// This is a placeholder for your API key - to be replaced by the user
const HUGGINGFACE_API_KEY = "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";

interface HuggingFaceResponse {
  generated_text: string;
}

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
    
    return data[0].generated_text.trim();
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

// Function to build the system prompt based on the current workflow state
export const buildSystemPrompt = (workflow: WorkflowData): string => {
  let prompt = "You are a helpful assistant that builds messaging workflows in a concise, neutral tone. Keep responses short (1-2 sentences).";
  
  // Add information about what's been collected so far
  const collectedInfo = [];
  
  if (workflow.keyword) {
    collectedInfo.push(`the keyword '${workflow.keyword}'`);
  }
  
  if (workflow.trigger_channel) {
    collectedInfo.push(`'${workflow.trigger_channel}' as the trigger channel`);
  }
  
  if (workflow.message.content) {
    collectedInfo.push("message content");
  }
  
  if (workflow.message.delay) {
    collectedInfo.push(`message delay of '${workflow.message.delay}'`);
  }
  
  if (collectedInfo.length > 0) {
    prompt += " So far, the user has provided " + collectedInfo.join(", ") + ".";
  }
  
  // Determine the next question based on what's missing
  if (!workflow.keyword) {
    prompt += " Ask what keyword should trigger this workflow.";
  } else if (!workflow.trigger_channel) {
    prompt += " Ask which channel should the user send this keyword from (SMS, WhatsApp, Email, Messenger only).";
  } else if (!workflow.message.content) {
    prompt += " Ask what message should be sent in response when someone sends the keyword.";
  } else if (!workflow.message.delay) {
    prompt += " Ask if they would like to delay this message.";
  } else {
    prompt += " Inform them the workflow configuration is complete.";
  }
  
  return prompt;
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

export const validateChannelInput = (input: string): boolean => {
  const allowedChannels = ["SMS", "WHATSAPP", "EMAIL", "MESSENGER"];
  return allowedChannels.includes(input.toUpperCase());
};

export const normalizeChannelInput = (input: string): string => {
  const map: Record<string, string> = {
    "SMS": "SMS",
    "WHATSAPP": "WhatsApp",
    "EMAIL": "Email",
    "MESSENGER": "Messenger"
  };
  
  return map[input.toUpperCase()] || input.toUpperCase();
};
