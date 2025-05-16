
import { WorkflowData, validateWorkflowTypeInput, validateChannelInput, workflowSlotDefinition } from "./huggingFaceApi";

// Clone the initial workflow slot definition
export const initializeWorkflowState = (): any => {
  return JSON.parse(JSON.stringify(workflowSlotDefinition));
};

// Get the next step based on current step and user input
export const getNextStep = (workflowState: any, currentStep: string, userInput: string): string => {
  const step = workflowState.steps[currentStep];
  
  if (!step) return "end";
  
  // For workflow type selection, validate and normalize the input
  if (currentStep === "workflow_type_selection") {
    const workflowType = validateWorkflowTypeInput(userInput);
    if (workflowType && step.next[workflowType]) {
      return step.next[workflowType];
    }
    // Invalid input, stay on the same step
    return currentStep;
  }
  
  // For other steps, just follow the predefined next step
  return step.next || "end";
};

// Update workflow data based on the current step and user input
export const updateWorkflowData = (
  workflowData: WorkflowData, 
  currentStep: string, 
  userInput: string
): WorkflowData => {
  const updatedData = { ...workflowData };
  
  // Handle each step's specific data update
  if (currentStep === "workflow_type_selection") {
    updatedData.workflow_type = validateWorkflowTypeInput(userInput) || undefined;
  } 
  else if (currentStep === "keyword_trigger.keyword") {
    updatedData.keyword = userInput.trim();
  }
  else if (currentStep === "keyword_trigger.channels") {
    updatedData.channels = validateChannelInput(userInput);
    updatedData.trigger_channel = updatedData.channels[0] || "SMS"; // Use the first channel as primary
  }
  else if (currentStep === "keyword_trigger.base_response") {
    if (!updatedData.message) {
      updatedData.message = { content: "", delay: "immediate" };
    }
    updatedData.message.content = userInput.trim();
  }
  else if (currentStep === "keyword_trigger.add_opt_out") {
    const response = userInput.trim().toLowerCase();
    updatedData.add_opt_out = response === "yes" || response === "y" || response.includes("yes");
    
    // If opt-out was added, update the message content
    if (updatedData.add_opt_out && updatedData.message) {
      updatedData.message.content += "\n\nReply STOP to unsubscribe.";
    }
  }
  else if (currentStep === "appointment_reminder.reminder_timing") {
    updatedData.reminder_timing = userInput.trim();
    if (!updatedData.message) {
      updatedData.message = { content: "", delay: userInput.trim() };
    } else {
      updatedData.message.delay = userInput.trim();
    }
  }
  else if (currentStep === "appointment_reminder.csv_uploaded") {
    updatedData.csv_uploaded = true;
  }
  else if (currentStep === "appointment_reminder.reminder_message") {
    if (!updatedData.message) {
      updatedData.message = { content: "", delay: updatedData.reminder_timing || "24 hours" };
    }
    updatedData.message.content = userInput.trim();
    updatedData.reminder_message = userInput.trim();
  }
  else if (currentStep === "appointment_reminder.add_opt_out") {
    const response = userInput.trim().toLowerCase();
    updatedData.add_opt_out = response === "yes" || response === "y" || response.includes("yes");
    
    // If opt-out was added, update the message content
    if (updatedData.add_opt_out && updatedData.message) {
      updatedData.message.content += "\n\nReply STOP to unsubscribe.";
    }
  }
  
  return updatedData;
};

// Check if the workflow is complete
export const isWorkflowComplete = (currentStep: string): boolean => {
  return currentStep === "end";
};

// Generate workflow steps for visualization
export const generateWorkflowSteps = (workflowData: WorkflowData): any[] => {
  const steps = [];
  
  if (workflowData.workflow_type === "keyword_trigger") {
    // Add keyword trigger step
    if (workflowData.keyword) {
      steps.push({
        id: 1,
        type: "trigger",
        description: `Keyword "${workflowData.keyword}" received via ${workflowData.channels?.join(", ") || workflowData.trigger_channel || "SMS"}`,
        channel: workflowData.trigger_channel as any
      });
    }
    
    // Add message response step
    if (workflowData.message?.content) {
      steps.push({
        id: 2,
        type: "message",
        description: workflowData.message.content,
        channel: workflowData.trigger_channel as any,
        timing: "Immediate" 
      });
    }
  } else if (workflowData.workflow_type === "appointment_reminder") {
    // Add appointment trigger step
    if (workflowData.reminder_timing) {
      steps.push({
        id: 1,
        type: "trigger",
        description: `Appointment reminder ${workflowData.reminder_timing} before appointment`,
        timing: workflowData.reminder_timing
      });
    }
    
    // Add CSV import step if applicable
    if (workflowData.csv_uploaded) {
      steps.push({
        id: 2,
        type: "condition",
        description: "Customer list uploaded from CSV"
      });
    }
    
    // Add reminder message step
    if (workflowData.message?.content) {
      steps.push({
        id: 3,
        type: "message",
        description: workflowData.message.content,
        timing: workflowData.reminder_timing
      });
    }
  }
  
  // Add final state if completed
  if (workflowData.launch_decision) {
    steps.push({
      id: steps.length + 1,
      type: "condition",
      description: `Workflow ${workflowData.launch_decision === "launched" ? "launched" : "saved as draft"}`
    });
  }
  
  return steps;
};

// Generate a downloadable CSV content file
export const generateSampleCSV = (): string => {
  return `Name,Phone,Preferred Channel,Opt-in SMS,Opt-in WhatsApp,Opt-in Email,Appointment Type,Appointment Date & Time,Notes
John Doe,+15551234567,SMS,Yes,No,Yes,Dental Checkup,2023-06-15 10:00:00,First time patient
Jane Smith,+15557654321,WhatsApp,Yes,Yes,Yes,Haircut,2023-06-16 14:30:00,Prefers stylist Mark
`;
};
