
// This is a placeholder for your API key - to be replaced by the user
const HUGGINGFACE_API_KEY = "YOUR_HF_API_KEY";

interface HuggingFaceResponse {
  generated_text: string;
}

export const getAIResponse = async (systemPrompt: string, userMessage: string): Promise<string> => {
  try {
    const headers = {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const body = {
      inputs: `${systemPrompt}\nUser: ${userMessage}`,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
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
      return "I'm having trouble understanding. Could you try again?";
    }
    
    return data[0].generated_text.trim();
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return "Sorry, I encountered an error. Please try again in a moment.";
  }
};

// Function to build the system prompt based on the current workflow state
export const buildSystemPrompt = (workflow: WorkflowData): string => {
  let prompt = "You are an assistant that helps users build a keyword-triggered messaging workflow.";
  
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
  
  if (workflow.message.channel) {
    collectedInfo.push(`'${workflow.message.channel}' as the message channel`);
  }
  
  if (workflow.message.delay) {
    collectedInfo.push(`message delay of '${workflow.message.delay}'`);
  }
  
  if (workflow.contact_upload.filename) {
    collectedInfo.push(`contact file '${workflow.contact_upload.filename}'`);
  }
  
  if (collectedInfo.length > 0) {
    prompt += " So far, the user has provided " + collectedInfo.join(", ") + ".";
  }
  
  // Determine the next question based on what's missing
  if (!workflow.keyword) {
    prompt += " Ask what keyword should trigger this workflow (e.g., 'DEMO', 'HELP', 'OFFER').";
  } else if (!workflow.trigger_channel) {
    prompt += " Ask which channel should the user send this keyword from (SMS, WhatsApp, Email, Messenger only).";
  } else if (!workflow.message.content) {
    prompt += " Ask what message they would like to send when the keyword is received.";
  } else if (!workflow.message.channel) {
    prompt += " Ask which channel should this message go out on (SMS, WhatsApp, Email, Messenger only).";
  } else if (!workflow.message.delay) {
    prompt += " Ask if they would like to delay this message (e.g., 'immediate', 'after 10 minutes').";
  } else if (!workflow.contact_upload.filename) {
    prompt += " Ask them to upload a CSV file (max 10MB) with Name, Phone, Email, Consent(Yes/No).";
  } else if (!workflow.launch_decision) {
    prompt += " Ask if they would like to launch this workflow now or save as draft.";
  } else {
    prompt += " Thank them for creating the workflow and inform them it has been processed according to their preference.";
  }
  
  return prompt;
};

// Types
export interface WorkflowData {
  keyword: string;
  trigger_channel: string;
  message: {
    content: string;
    channel: string;
    delay: string;
  };
  contact_upload: {
    filename: string;
    total_contacts: number;
    with_consent: number;
    without_consent: number;
  };
  launch_decision: string;
}

export const validateChannelInput = (input: string): boolean => {
  const allowedChannels = ["SMS", "WhatsApp", "Email", "Messenger"];
  return allowedChannels.includes(input);
};
