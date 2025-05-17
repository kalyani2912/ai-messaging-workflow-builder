
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

// Generate contextual prompt based on current step and workflow data
export const generateContextualPrompt = (
  currentStep: string, 
  workflowData: import("../types/workflow").WorkflowData,
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
