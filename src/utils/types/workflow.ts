
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
  trigger_type?: string;
  trigger_value?: string;
  provider_response?: string;
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
}
