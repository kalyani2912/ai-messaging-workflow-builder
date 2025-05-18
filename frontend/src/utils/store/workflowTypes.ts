
import { ExecutableWorkflow, ExecutionLogEntry, ContactData } from "../types/workflow";

export interface ConversationItem {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

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
  conversationHistory: ConversationItem[];
  createdAt: string;
  updatedAt: string;
  last_run_at: string | null;
  channels?: string[];
  executable_workflow?: ExecutableWorkflow;
  execution_log?: ExecutionLogEntry[];
  // Adding the trigger property to match what WebhookSimulator expects
  trigger: {
    keyword: string;
    channels: string[];
  };
  contacts?: ContactData[];
  crm_source?: 'csv' | 'hubspot';
  add_opt_out?: boolean;
  opt_out_message?: string;
}
