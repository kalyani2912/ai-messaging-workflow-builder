
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
  crm_source?: 'csv' | 'hubspot';
  selected_contacts?: ContactData[];
}

export interface ContactData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  preferred_channel?: string;
  opt_in: boolean;
  appointment_type?: string;
  appointment_time?: string;
  appointment_notes?: string;
  crm_id?: string;
}

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
  contacts?: ContactData[];
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
  trigger_type?: string;
  trigger_value?: string;
  provider_response?: string;
  direction?: 'incoming' | 'outgoing';
  personalized_content?: string;
  original_content?: string;
}

// Adding this interface to match what WebhookSimulator expects
export interface StoredWorkflow {
  id: string;
  userId: string;
  workflow_type?: string;
  keyword: string;
  trigger_channel: string;
  message: {
    content: string;
    delay: string;
  };
  status: 'draft' | 'launched' | 'active';
  conversationHistory: any[];  // Using any[] as a placeholder
  createdAt: string;
  updatedAt: string;
  last_run_at: string | null;
  channels?: string[];
  executable_workflow?: ExecutableWorkflow;
  execution_log?: ExecutionLogEntry[];
  // Adding this trigger property to match what the component is using
  trigger: {
    keyword: string;
    channels: string[];
  };
  contacts?: ContactData[];
  crm_source?: 'csv' | 'hubspot';
  add_opt_out?: boolean;
  opt_out_message?: string;
}

// CRM Integration types
export interface HubSpotCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
}

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    opt_in?: boolean;
    [key: string]: any;
  }
}

export interface HubSpotMeeting {
  id: string;
  properties: {
    hs_meeting_title?: string;
    hs_meeting_body?: string;
    hs_meeting_start_time?: string;
    hs_meeting_end_time?: string;
    [key: string]: any;
  }
}
