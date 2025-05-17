
import { getCurrentUser } from "../userStore";
import { toast } from "@/hooks/use-toast";
import { ConversationItem, StoredWorkflow, WorkflowData } from "./workflowTypes";
import { generateWorkflowJSON } from "./workflowGenerator";
import { workflows, executableWorkflows } from "./workflowStorage";
import { getActiveWorkflows, getWorkflowExecutionLogs, updateWorkflowExecutionLog } from "./workflowExecution";

export const saveWorkflow = (
  workflowData: WorkflowData, 
  status: 'draft' | 'launched',
  conversationHistory: ConversationItem[]
): Promise<StoredWorkflow | null> => {
  return new Promise((resolve) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save workflows.",
        variant: "destructive"
      });
      resolve(null);
      return;
    }
    
    // Check if this is an update to an existing workflow
    const existingIndex = workflows.findIndex(
      w => w.userId === currentUser.id && w.keyword === workflowData.keyword
    );
    
    const now = new Date().toISOString();
    
    // Generate the executable workflow JSON
    let executableWorkflow: ReturnType<typeof generateWorkflowJSON> | undefined;
    
    if (status === 'launched') {
      executableWorkflow = generateWorkflowJSON(
        workflowData, 
        currentUser.id,
        currentUser.email || '',
        currentUser.phone || ''
      );
      
      // Add to executable workflows if it's being launched
      const existingExecIndex = executableWorkflows.findIndex(w => w.id === executableWorkflow?.id);
      if (existingExecIndex >= 0) {
        executableWorkflows[existingExecIndex] = executableWorkflow;
      } else if (executableWorkflow) {
        executableWorkflows.push(executableWorkflow);
      }
    }
    
    if (existingIndex >= 0) {
      // Update existing workflow
      const updated = {
        ...workflows[existingIndex],
        workflow_type: workflowData.workflow_type || workflows[existingIndex].workflow_type,
        keyword: workflowData.keyword || workflows[existingIndex].keyword,
        trigger_channel: workflowData.trigger_channel || workflows[existingIndex].trigger_channel,
        channels: workflowData.channels || workflows[existingIndex].channels,
        message: {
          content: workflowData.message?.content || workflows[existingIndex].message.content,
          delay: workflowData.message?.delay || workflows[existingIndex].message.delay,
        },
        status: status === 'launched' ? 'active' : 'draft',
        conversationHistory,
        updatedAt: now,
        // Only update last_run_at if the status is 'launched' and it's a new launch or was previously a draft
        last_run_at: status === 'launched' ? 
          (workflows[existingIndex].status === 'draft' || !workflows[existingIndex].last_run_at ? now : workflows[existingIndex].last_run_at) 
          : workflows[existingIndex].last_run_at,
        executable_workflow: status === 'launched' ? executableWorkflow : undefined,
        execution_log: status === 'launched' ? [] : undefined,
        // Update the trigger property to match the expected format
        trigger: {
          keyword: workflowData.keyword || workflows[existingIndex].keyword,
          channels: workflowData.channels || 
                   (workflowData.trigger_channel ? [workflowData.trigger_channel] : 
                    workflows[existingIndex].channels || 
                    [workflows[existingIndex].trigger_channel])
        }
      };
      
      workflows[existingIndex] = updated as StoredWorkflow;
      
      // Update localStorage
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      toast({
        title: status === 'launched' ? "Workflow launched" : "Workflow updated",
        description: `Workflow "${workflowData.keyword || 'Workflow'}" has been ${status === 'launched' ? 'launched' : 'updated'}.`,
      });
      
      // Simulate network delay
      setTimeout(() => resolve(updated as StoredWorkflow), 500);
    } else {
      // Create new workflow
      const newWorkflow: StoredWorkflow = {
        id: `workflow_${Date.now()}`,
        userId: currentUser.id,
        workflow_type: workflowData.workflow_type,
        keyword: workflowData.keyword || '',
        trigger_channel: workflowData.trigger_channel || 'SMS',
        channels: workflowData.channels,
        message: {
          content: workflowData.message?.content || '',
          delay: workflowData.message?.delay || 'immediate',
        },
        status: status === 'launched' ? 'active' : 'draft',
        conversationHistory,
        createdAt: now,
        updatedAt: now,
        last_run_at: status === 'launched' ? now : null,
        executable_workflow: status === 'launched' ? executableWorkflow : undefined,
        execution_log: status === 'launched' ? [] : undefined,
        // Add the trigger property with the expected format
        trigger: {
          keyword: workflowData.keyword || '',
          channels: workflowData.channels || 
                   (workflowData.trigger_channel ? [workflowData.trigger_channel] : ['SMS'])
        }
      };
      
      workflows.push(newWorkflow);
      
      // Update localStorage
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      toast({
        title: status === 'launched' ? "Workflow launched" : "Workflow saved",
        description: `Workflow "${workflowData.keyword || 'New workflow'}" has been ${status === 'launched' ? 'launched as active' : 'saved as draft'}.`,
      });
      
      // Simulate network delay
      setTimeout(() => resolve(newWorkflow), 500);
    }
  });
};

export const getWorkflows = (): StoredWorkflow[] => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return [];
  }
  
  return workflows.filter(workflow => workflow.userId === currentUser.id);
};

export const getWorkflowById = (id: string): StoredWorkflow | undefined => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return undefined;
  }
  
  return workflows.find(
    workflow => workflow.id === id && workflow.userId === currentUser.id
  );
};

export const deleteWorkflow = (id: string): boolean => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return false;
  }
  
  const initialCount = workflows.length;
  
  // Find the workflow to get its executable_workflow ID
  const workflow = workflows.find(w => w.id === id && w.userId === currentUser.id);
  
  if (workflow?.executable_workflow) {
    // Remove from executable workflows
    const execIndex = executableWorkflows.findIndex(w => w.id === workflow.executable_workflow?.id);
    if (execIndex >= 0) {
      executableWorkflows.splice(execIndex, 1);
    }
  }
  
  const newWorkflows = workflows.filter(
    workflow => !(workflow.id === id && workflow.userId === currentUser.id)
  );
  
  if (newWorkflows.length < initialCount) {
    // Update the original array
    workflows.length = 0;
    workflows.push(...newWorkflows);
    
    // Update localStorage
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    toast({
      title: "Workflow deleted",
      description: "The workflow has been deleted.",
    });
    
    return true;
  }
  
  return false;
};

// Re-export other workflow functions for better API
export { getActiveWorkflows, getWorkflowExecutionLogs, updateWorkflowExecutionLog };
