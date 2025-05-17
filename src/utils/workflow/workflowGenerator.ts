
import { WorkflowData, ExecutableWorkflow, ActionMessages } from "../types/workflow";

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

// Export default sample CSV content for appointment reminders
export const getSampleCSVContent = (): string => {
  return `Name,Phone,Preferred Channel,Opt-in SMS,Opt-in WhatsApp,Opt-in Email,Appointment Type,Appointment Date & Time,Notes
John Doe,+15551234567,SMS,Yes,No,Yes,Dental Checkup,2023-06-15 10:00:00,First time patient
Jane Smith,+15557654321,WhatsApp,Yes,Yes,Yes,Haircut,2023-06-16 14:30:00,Prefers stylist Mark
`;
};
