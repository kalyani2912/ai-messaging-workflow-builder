
import { ExecutableWorkflow, ExecutionLogEntry } from "../types/workflow";
import { toast } from "@/hooks/use-toast";
import { StoredWorkflow } from "./workflowTypes";
import { workflows, executableWorkflows } from "./workflowStorage";

// Get all active executable workflows
export const getActiveWorkflows = (): ExecutableWorkflow[] => {
  return executableWorkflows.filter(workflow => workflow.status === 'active');
};

// Add execution log entry to a workflow
export const updateWorkflowExecutionLog = (workflowId: string, logEntry: ExecutionLogEntry): void => {
  // Find the workflow in executable workflows
  const workflowIndex = executableWorkflows.findIndex(w => w.id === workflowId);
  
  if (workflowIndex >= 0) {
    // Add the log entry
    executableWorkflows[workflowIndex].execution_log.push(logEntry);
    
    // Find the corresponding stored workflow
    const storedWorkflow = workflows.find(w => w.executable_workflow?.id === workflowId);
    
    if (storedWorkflow) {
      // Update the stored workflow's execution log
      if (!storedWorkflow.execution_log) {
        storedWorkflow.execution_log = [];
      }
      storedWorkflow.execution_log.push(logEntry);
      
      // Update localStorage
      localStorage.setItem('workflows', JSON.stringify(workflows));
    }
  }
};

// Get execution logs for a workflow
export const getWorkflowExecutionLogs = (workflowId: string): ExecutionLogEntry[] => {
  // Find the workflow
  const workflow = workflows.find(w => w.id === workflowId);
  
  if (workflow?.execution_log) {
    return workflow.execution_log;
  }
  
  return [];
};
