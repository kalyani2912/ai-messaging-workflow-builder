
import { getActiveWorkflows, updateWorkflowExecutionLog } from "./workflowStore";
import { ExecutionLogEntry } from "./openAiApi";
import { sendMessage } from "./messagingService";

// Interface for inbound message payloads
interface InboundTextMessage {
  from: string;
  text: string;
}

interface InboundEmailMessage {
  from: string;
  subject: string;
  body?: string;
}

// Process an inbound SMS message
export const processInboundSMS = async (payload: InboundTextMessage): Promise<boolean> => {
  console.log('Processing inbound SMS:', payload);
  return await processInboundMessage(payload.from, payload.text, 'sms');
};

// Process an inbound WhatsApp message
export const processInboundWhatsApp = async (payload: InboundTextMessage): Promise<boolean> => {
  console.log('Processing inbound WhatsApp:', payload);
  return await processInboundMessage(payload.from, payload.text, 'whatsapp');
};

// Process an inbound Email
export const processInboundEmail = async (payload: InboundEmailMessage): Promise<boolean> => {
  console.log('Processing inbound Email:', payload);
  return await processInboundMessage(payload.from, payload.subject, 'email');
};

// Generic handler for processing inbound messages
async function processInboundMessage(
  sender: string, 
  content: string, 
  channel: string
): Promise<boolean> {
  // Get all active workflows
  const activeWorkflows = getActiveWorkflows();
  
  // Normalize content for keyword matching
  const normalizedContent = content.trim().toLowerCase();
  
  // Find matching workflows
  const matchingWorkflows = activeWorkflows.filter(workflow => {
    // Check if workflow is triggered by this channel
    const isChannelMatch = workflow.trigger.channels.some(
      c => c.toLowerCase() === channel.toLowerCase()
    );
    
    // Check if the content contains the keyword
    const isKeywordMatch = normalizedContent.includes(
      workflow.trigger.keyword.toLowerCase()
    );
    
    return isChannelMatch && isKeywordMatch;
  });
  
  if (matchingWorkflows.length === 0) {
    console.log(`No matching workflows found for ${channel} message from ${sender}`);
    return false;
  }
  
  console.log(`Found ${matchingWorkflows.length} matching workflows`);
  
  // Execute each matching workflow
  for (const workflow of matchingWorkflows) {
    try {
      // Get the message for this channel
      let message = '';
      let subject = '';
      
      if (channel === 'email' && workflow.action.messages.email) {
        message = workflow.action.messages.email.body;
        subject = workflow.action.messages.email.subject;
      } else if (channel === 'sms' && workflow.action.messages.sms) {
        message = workflow.action.messages.sms;
      } else if (channel === 'whatsapp' && workflow.action.messages.whatsapp) {
        message = workflow.action.messages.whatsapp;
      } else if (channel === 'messenger' && workflow.action.messages.messenger) {
        message = workflow.action.messages.messenger;
      } else {
        // No message for this channel
        continue;
      }
      
      // Send the message (with delay if specified)
      const delay = workflow.action.delay !== 'immediate'
        ? parseDelayToMs(workflow.action.delay)
        : 0;
      
      if (delay > 0) {
        // Schedule the message
        setTimeout(() => {
          executeMessageSend(workflow.id, sender, message, channel as any, subject);
        }, delay);
        
        // Log the scheduled message
        const logEntry: ExecutionLogEntry = {
          timestamp: new Date().toISOString(),
          channel,
          recipient: sender,
          status: 'success',
          message: `Scheduled to send in ${workflow.action.delay}`
        };
        
        updateWorkflowExecutionLog(workflow.id, logEntry);
      } else {
        // Send immediately
        await executeMessageSend(workflow.id, sender, message, channel as any, subject);
      }
    } catch (error) {
      console.error(`Error executing workflow ${workflow.id}:`, error);
      
      // Log the error
      const logEntry: ExecutionLogEntry = {
        timestamp: new Date().toISOString(),
        channel,
        recipient: sender,
        status: 'error',
        message: 'Failed to execute workflow',
        error: error instanceof Error ? error.message : String(error)
      };
      
      updateWorkflowExecutionLog(workflow.id, logEntry);
    }
  }
  
  return true;
}

// Helper function to execute message sending and log the result
async function executeMessageSend(
  workflowId: string, 
  recipient: string, 
  message: string, 
  channel: 'sms' | 'whatsapp' | 'email' | 'messenger',
  subject = ''
): Promise<void> {
  try {
    await sendMessage(recipient, message, channel, subject);
    
    // Log the success
    const logEntry: ExecutionLogEntry = {
      timestamp: new Date().toISOString(),
      channel,
      recipient,
      status: 'success',
      message: `Sent message via ${channel}`
    };
    
    updateWorkflowExecutionLog(workflowId, logEntry);
  } catch (error) {
    // Log the error
    const logEntry: ExecutionLogEntry = {
      timestamp: new Date().toISOString(),
      channel,
      recipient,
      status: 'error',
      message: `Failed to send message via ${channel}`,
      error: error instanceof Error ? error.message : String(error)
    };
    
    updateWorkflowExecutionLog(workflowId, logEntry);
  }
}

// Helper function to parse delay string to milliseconds
function parseDelayToMs(delayStr: string): number {
  const normalized = delayStr.trim().toLowerCase();
  
  // Handle special case
  if (normalized === 'immediate' || normalized === 'now') {
    return 0;
  }
  
  // Parse number and unit
  const match = normalized.match(/^(\d+)\s*(minute|minutes|min|hour|hours|day|days|second|seconds|sec|s|m|h|d)s?$/);
  
  if (!match) {
    return 0; // Default to immediate if format is not recognized
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  // Convert to milliseconds
  switch(unit) {
    case 'second':
    case 'seconds':
    case 'sec':
    case 's':
      return value * 1000;
    case 'minute':
    case 'minutes':
    case 'min':
    case 'm':
      return value * 60 * 1000;
    case 'hour':
    case 'hours':
    case 'h':
      return value * 60 * 60 * 1000;
    case 'day':
    case 'days':
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

// For demo/testing purposes - simulation endpoints
export const simulateInboundSMS = (from: string, text: string): Promise<boolean> => {
  return processInboundSMS({ from, text });
};

export const simulateInboundWhatsApp = (from: string, text: string): Promise<boolean> => {
  return processInboundWhatsApp({ from, text });
};

export const simulateInboundEmail = (from: string, subject: string, body?: string): Promise<boolean> => {
  return processInboundEmail({ from, subject, body });
};
