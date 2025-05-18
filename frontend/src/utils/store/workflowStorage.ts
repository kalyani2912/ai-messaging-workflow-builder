// src/utils/workflowStorage.ts

/**
 * DEPRECATED: This module no longer uses in-memory or localStorage for workflows.
 * All workflow data is now loaded and saved via backend APIs.
 *
 * Use the functions in:
 *  - workflowOperations.ts  (for CRUD operations on workflows)
 *  - workflowExecution.ts   (for execution logs and active workflows)
 * to interact with workflows and execution logs.
 */

import { StoredWorkflow } from "./workflowTypes";
import { ExecutableWorkflow } from "../types/workflow";

// These arrays are placeholders and remain empty.
// Their data will be populated by calling backend APIs, not by localStorage.
export const workflows: StoredWorkflow[] = [];
export const executableWorkflows: ExecutableWorkflow[] = [];







/*import { StoredWorkflow } from "./workflowTypes";
import { ExecutableWorkflow } from "../types/workflow";

// In-memory workflow store (in a real app, this would be a database)
export const workflows: StoredWorkflow[] = [];

// In-memory store for executable workflows
export const executableWorkflows: ExecutableWorkflow[] = [];

// Load workflows from localStorage on module initialization
try {
  const storedWorkflows = localStorage.getItem('workflows');
  if (storedWorkflows) {
    const parsedWorkflows = JSON.parse(storedWorkflows);
    if (Array.isArray(parsedWorkflows)) {
      // Ensure all workflows have the last_run_at and trigger fields
      const updatedWorkflows = parsedWorkflows.map(workflow => ({
        ...workflow,
        workflow_type: workflow.workflow_type || undefined,
        last_run_at: workflow.last_run_at || (workflow.status === 'launched' ? workflow.updatedAt : null),
        execution_log: workflow.execution_log || [],
        // Ensure the trigger property exists
        trigger: workflow.trigger || {
          keyword: workflow.keyword || '',
          channels: workflow.channels || [workflow.trigger_channel]
        }
      }));
      workflows.push(...updatedWorkflows);
      
      // Populate executable workflows from stored data
      for (const workflow of updatedWorkflows) {
        if (workflow.status === 'active' && workflow.executable_workflow) {
          executableWorkflows.push(workflow.executable_workflow);
        }
      }
    }
  }
} catch (error) {
  console.error('Failed to load workflows from localStorage:', error);
}
*/