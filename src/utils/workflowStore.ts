
import { getCurrentUser } from "./userStore";
import { WorkflowData, ExecutableWorkflow, ExecutionLogEntry, generateWorkflowJSON } from "./openAiApi";
import { toast } from "@/hooks/use-toast";

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
}

export interface ConversationItem {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

// In-memory workflow store (in a real app, this would be a database)
const workflows: StoredWorkflow[] = [];

// In-memory store for executable workflows
const executableWorkflows: ExecutableWorkflow[] = [];

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
    let executableWorkflow: ExecutableWorkflow | undefined;
    
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
        execution_log: status === 'launched' ? [] : undefined
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
        execution_log: status === 'launched' ? [] : undefined
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

// Load workflows from localStorage on module initialization
try {
  const storedWorkflows = localStorage.getItem('workflows');
  if (storedWorkflows) {
    const parsedWorkflows = JSON.parse(storedWorkflows);
    if (Array.isArray(parsedWorkflows)) {
      // Ensure all workflows have the last_run_at field
      const updatedWorkflows = parsedWorkflows.map(workflow => ({
        ...workflow,
        workflow_type: workflow.workflow_type || undefined,
        last_run_at: workflow.last_run_at || (workflow.status === 'launched' ? workflow.updatedAt : null),
        execution_log: workflow.execution_log || []
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
