
import { getCurrentUser } from "./userStore";
import { WorkflowData } from "./openAiApi";
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
  status: 'draft' | 'launched';
  conversationHistory: ConversationItem[];
  createdAt: string;
  updatedAt: string;
  last_run_at: string | null;
  channels?: string[];
}

export interface ConversationItem {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

// In-memory workflow store (in a real app, this would be a database)
const workflows: StoredWorkflow[] = [];

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
        status,
        conversationHistory,
        updatedAt: now,
        // Only update last_run_at if the status is 'launched' and it's a new launch or was previously a draft
        last_run_at: status === 'launched' ? 
          (workflows[existingIndex].status === 'draft' || !workflows[existingIndex].last_run_at ? now : workflows[existingIndex].last_run_at) 
          : workflows[existingIndex].last_run_at
      };
      
      workflows[existingIndex] = updated as StoredWorkflow;
      
      // Update localStorage
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      toast({
        title: "Workflow updated",
        description: `Workflow "${workflowData.keyword || 'Workflow'}" has been updated.`,
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
        status,
        conversationHistory,
        createdAt: now,
        updatedAt: now,
        last_run_at: status === 'launched' ? now : null
      };
      
      workflows.push(newWorkflow);
      
      // Update localStorage
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      toast({
        title: "Workflow saved",
        description: `Workflow "${workflowData.keyword || 'New workflow'}" has been saved as ${status}.`,
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
        last_run_at: workflow.last_run_at || (workflow.status === 'launched' ? workflow.updatedAt : null)
      }));
      workflows.push(...updatedWorkflows);
    }
  }
} catch (error) {
  console.error('Failed to load workflows from localStorage:', error);
}
