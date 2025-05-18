
import { ExecutableWorkflow } from "../types/workflow";
import { WorkflowData } from "./workflowTypes";

// Generate workflow JSON structure for execution
export function generateWorkflowJSON(
  workflowData: WorkflowData,
  userId: string,
  email: string,
  phone: string
): ExecutableWorkflow {
  return {
    id: `exec_workflow_${Date.now()}`,
    status: 'active',
    type: workflowData.workflow_type || 'keyword_trigger',
    trigger: {
      keyword: workflowData.keyword || '',
      channels: workflowData.channels || (workflowData.trigger_channel ? [workflowData.trigger_channel] : ['SMS'])
    },
    action: {
      type: 'send_message',
      delay: workflowData.message?.delay || 'immediate',
      messages: {
        sms: workflowData.message?.content,
        whatsapp: workflowData.message?.content,
        messenger: workflowData.message?.content,
        email: {
          subject: workflowData.keyword || 'No Subject',
          body: workflowData.message?.content || ''
        }
      }
    },
    owner: {
      user_id: userId,
      email,
      phone
    },
    execution_log: []
  };
}
