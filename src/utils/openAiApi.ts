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

// Validate and normalize user input for workflow type selection
export const validateWorkflowTypeInput = (input: string): string | null => {
  const normalized = input.trim().toLowerCase();
  
  if (['1', 'keyword', 'trigger'].includes(normalized)) {
    return 'keyword_trigger';
  }
  
  if (['2', 'appointment', 'reminder'].includes(normalized)) {
    return 'appointment_reminder';
  }
  
  return null;
};

// Validate channel input with normalization
export const validateChannelInput = (input: string): string[] => {
  const normalizedInput = input.trim().toLowerCase();
  const channels = normalizedInput.split(/[,;]/);
  const allowedChannels = ["sms", "whatsapp", "email", "messenger"];
  
  return channels
    .map(channel => channel.trim())
    .filter(channel => allowedChannels.includes(channel))
    .map(channel => normalizeChannelInput(channel));
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

// Handle malformed or blank responses
export const handleResponseError = (response: string | null): string => {
  if (!response || response.trim().length === 0) {
    return "Sorry, something went wrong. Please try again.";
  }
  
  return response;
};

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
export const getWorkflowVisualization = async (workflowData: WorkflowData): Promise<string> => {
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

// Types for the workflow data
export interface WorkflowData {
  workflow_type?: string;
  keyword?: string;
  trigger_channel?: string;
  channels?: string[];
  message?: {
    content: string;
    delay: string;
  };
  reminder_timing?: string;
  reminder_message?: string;
  csv_uploaded?: boolean;
  add_opt_out?: boolean;
  launch_decision?: string;
}

// Generate a structured workflow JSON for execution
export const generateWorkflowJSON = (workflowData: WorkflowData, userId: string, userEmail: string = "", userPhone: string = ""): ExecutableWorkflow => {
  const workflowId = `workflow_${Date.now()}`;
  
  const workflow: ExecutableWorkflow = {
    id: workflowId,
    status: workflowData.launch_decision === 'launched' ? 'active' : 'draft',
    type: workflowData.workflow_type || 'keyword_trigger',
    trigger: {
      keyword: workflowData.keyword || '',
      channels: workflowData.channels || [workflowData.trigger_channel || 'SMS']
    },
    action: {
      type: 'send_message',
      delay: workflowData.message?.delay || 'immediate',
      messages: {}
    },
    owner: {
      user_id: userId,
      email: userEmail,
      phone: userPhone
    },
    execution_log: []
  };
  
  // Set up messages for each channel
  if (workflowData.channels && workflowData.message?.content) {
    const messageContent = workflowData.message.content;
    
    workflowData.channels.forEach(channel => {
      if (channel.toLowerCase() === 'email') {
        workflow.action.messages.email = {
          subject: `${workflowData.keyword || 'Notification'}`,
          body: messageContent
        };
      } else {
        const channelKey = channel.toLowerCase() as keyof ActionMessages;
        if (channelKey === 'sms' || channelKey === 'whatsapp' || channelKey === 'messenger') {
          workflow.action.messages[channelKey] = messageContent;
        }
      }
    });
  } else if (workflowData.trigger_channel && workflowData.message?.content) {
    const channel = workflowData.trigger_channel.toLowerCase();
    if (channel === 'email') {
      workflow.action.messages.email = {
        subject: `${workflowData.keyword || 'Notification'}`,
        body: workflowData.message.content
      };
    } else if (channel === 'sms' || channel === 'whatsapp' || channel === 'messenger') {
      const channelKey = channel as keyof ActionMessages;
      if (channelKey === 'sms' || channelKey === 'whatsapp' || channelKey === 'messenger') {
        workflow.action.messages[channelKey] = workflowData.message.content;
      }
    }
  }
  
  return workflow;
};

// Workflow slot structure for managing conversation state
export const workflowSlotDefinition = {
  "workflow_type": null,
  "slots": {
    "keyword_trigger": {
      "keyword": null,
      "channels": null,
      "base_response": null,
      "approved_responses": null,
      "add_opt_out": null
    },
    "appointment_reminder": {
      "reminder_timing": null,
      "csv_uploaded": null,
      "reminder_message": null,
      "add_opt_out": null
    }
  },
  "current_step": "workflow_type_selection",
  "steps": {
    "workflow_type_selection": {
      "prompt": "What kind of automation would you like to build today? Please choose by entering the number or name:\n1. Keyword Trigger Automation\n2. Appointment Reminder",
      "field": "workflow_type",
      "type": "choice",
      "next": {
        "keyword_trigger": "keyword_trigger.keyword",
        "appointment_reminder": "appointment_reminder.reminder_timing"
      }
    },
    "keyword_trigger.keyword": {
      "prompt": "What keyword should trigger the automation?",
      "field": "keyword",
      "next": "keyword_trigger.channels"
    },
    "keyword_trigger.channels": {
      "prompt": "Which channels should we watch for this keyword? (SMS, WhatsApp, Email, Messenger — you can select one or more)",
      "field": "channels",
      "type": "multi-choice",
      "next": "keyword_trigger.base_response"
    },
    "keyword_trigger.base_response": {
      "prompt": "What message should be sent when the keyword is received?",
      "field": "base_response",
      "next": "keyword_trigger.add_opt_out"
    },
    "keyword_trigger.add_opt_out": {
      "prompt": "Would you like me to append an opt-out message (e.g., 'Reply STOP to opt out')?",
      "field": "add_opt_out",
      "next": "end"
    },
    "appointment_reminder.reminder_timing": {
      "prompt": "How long before the appointment should the reminder be sent? (e.g., 24 hours, 2 hours)",
      "field": "reminder_timing",
      "next": "appointment_reminder.csv_uploaded"
    },
    "appointment_reminder.csv_uploaded": {
      "prompt": "Please upload a CSV file with appointment and customer details. You can use the upload button below.",
      "field": "csv_uploaded",
      "type": "file_upload",
      "next": "appointment_reminder.reminder_message"
    },
    "appointment_reminder.reminder_message": {
      "prompt": "What message should be sent as the appointment reminder?",
      "field": "reminder_message",
      "next": "appointment_reminder.add_opt_out"
    },
    "appointment_reminder.add_opt_out": {
      "prompt": "Would you like me to append an opt-out message (e.g., 'Reply STOP to opt out')?",
      "field": "add_opt_out",
      "next": "end"
    }
  }
};

// Export default sample CSV content for appointment reminders
export const getSampleCSVContent = (): string => {
  return `Name,Phone,Preferred Channel,Opt-in SMS,Opt-in WhatsApp,Opt-in Email,Appointment Type,Appointment Date & Time,Notes
John Doe,+15551234567,SMS,Yes,No,Yes,Dental Checkup,2023-06-15 10:00:00,First time patient
Jane Smith,+15557654321,WhatsApp,Yes,Yes,Yes,Haircut,2023-06-16 14:30:00,Prefers stylist Mark
`;
};

// Generate contextual prompt based on current step and workflow data
export const generateContextualPrompt = (
  currentStep: string, 
  workflowData: WorkflowData,
  steps: any
): string => {
  if (!steps[currentStep]) {
    return "What kind of automation would you like to build today?";
  }
  
  const step = steps[currentStep];
  let prompt = step.prompt;
  
  // Add context based on previous inputs
  if (currentStep === "keyword_trigger.channels" && workflowData.keyword) {
    prompt = `Got it. The keyword is "${workflowData.keyword}". ${prompt}`;
  } 
  else if (currentStep === "keyword_trigger.base_response" && workflowData.channels) {
    prompt = `Thanks, we'll watch for the keyword on ${workflowData.channels.join(", ")}. ${prompt}`;
  }
  else if (currentStep === "keyword_trigger.add_opt_out" && workflowData.message?.content) {
    prompt = `Great! The message is set. ${prompt}`;
  }
  else if (currentStep === "appointment_reminder.csv_uploaded" && workflowData.reminder_timing) {
    prompt = `Got it. The reminder will be sent ${workflowData.reminder_timing} before the appointment. ${prompt}`;
  }
  else if (currentStep === "appointment_reminder.reminder_message" && workflowData.csv_uploaded) {
    prompt = `Thanks for uploading the CSV. ${prompt}`;
  }
  
  return prompt;
};

// Types for executable workflows
export interface ExecutableWorkflow {
  id: string;
  status: 'active' | 'draft';
  type: string;
  trigger: {
    keyword: string;
    channels: string[];
  };
  action: {
    type: string;
    delay: string;
    messages: ActionMessages;
  };
  owner: {
    user_id: string;
    email: string;
    phone: string;
  };
  execution_log: ExecutionLogEntry[];
}

export interface ActionMessages {
  sms?: string;
  whatsapp?: string;
  messenger?: string;
  email?: {
    subject: string;
    body: string;
  };
}

export interface ExecutionLogEntry {
  timestamp: string;
  channel: string;
  recipient: string;
  status: 'success' | 'error';
  message: string;
  error?: string;
}
