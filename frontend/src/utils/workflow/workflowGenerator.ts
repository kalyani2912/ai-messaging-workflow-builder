
import { WorkflowData, ExecutableWorkflow, ActionMessages, ContactData } from "../types/workflow";

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
  
  // Add contacts for appointment reminders or CRM-based workflows
  if (workflowData.selected_contacts && workflowData.selected_contacts.length > 0) {
    workflow.contacts = workflowData.selected_contacts;
  }
  
  return workflow;
};

// Export default sample CSV content for appointment reminders
export const getSampleCSVContent = (): string => {
  return `Name,Phone,Email,Preferred Channel,Opt-in SMS,Opt-in WhatsApp,Opt-in Email,Appointment Type,Appointment Date & Time,Notes
John Doe,+15551234567,johndoe@example.com,SMS,Yes,No,Yes,Dental Checkup,2023-06-15 10:00:00,First time patient
Jane Smith,+15557654321,janesmith@example.com,WhatsApp,Yes,Yes,Yes,Haircut,2023-06-16 14:30:00,Prefers stylist Mark
Robert Johnson,+15559876543,robert@example.com,Email,Yes,No,Yes,Medical Consultation,2023-06-17 09:15:00,Annual checkup
Emily Williams,+15551112222,emily@example.com,SMS,Yes,No,No,Car Service,2023-06-18 13:45:00,Oil change
`;
};

// Parse and transform imported contacts (from CSV or CRM)
export const processContactData = (rawData: any[]): ContactData[] => {
  return rawData.map((row, index) => {
    // Handle different formats from CSV vs CRM
    return {
      id: `contact_${index}_${Date.now()}`,
      name: row.Name || `${row.firstname || ''} ${row.lastname || ''}`.trim(),
      phone: row.Phone || row.phone,
      email: row.Email || row.email,
      preferred_channel: row['Preferred Channel'] || row.preferred_channel || 'SMS',
      opt_in: isOptIn(row),
      appointment_type: row['Appointment Type'] || row.appointmentType,
      appointment_time: row['Appointment Date & Time'] || row.appointmentTime,
      appointment_notes: row.Notes || row.notes,
      crm_id: row.id || undefined
    };
  });
};

// Helper to determine opt-in status from various formats
function isOptIn(row: any): boolean {
  // Check various field names for opt-in
  return (
    row['Opt-in'] === 'Yes' || 
    row['Opt-in'] === true ||
    row['Opt-in SMS'] === 'Yes' ||
    row['Opt-in WhatsApp'] === 'Yes' ||
    row['Opt-in Email'] === 'Yes' ||
    row.opt_in === true ||
    row.opt_in === 'Yes'
  );
}

// Process placeholders in message templates
export const personalizeMessage = (template: string, contactData: ContactData): string => {
  if (!template) return '';
  
  let personalized = template;
  
  // Replace common placeholders
  if (contactData.name) {
    personalized = personalized.replace(/{{name}}/g, contactData.name);
  }
  if (contactData.appointment_time) {
    personalized = personalized.replace(/{{appointment_time}}/g, contactData.appointment_time);
  }
  if (contactData.appointment_type) {
    personalized = personalized.replace(/{{appointment_type}}/g, contactData.appointment_type);
  }
  
  // Replace any custom fields that might be in the data
  Object.keys(contactData).forEach(key => {
    const placeholder = `{{${key}}}`;
    if (personalized.includes(placeholder) && contactData[key as keyof ContactData]) {
      personalized = personalized.replace(
        new RegExp(placeholder, 'g'), 
        String(contactData[key as keyof ContactData])
      );
    }
  });
  
  return personalized;
};
