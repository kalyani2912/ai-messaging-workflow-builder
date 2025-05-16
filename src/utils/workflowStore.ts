
import { getCurrentUser } from "./userStore";
import { WorkflowData } from "./huggingFaceApi";
import { toast } from "@/hooks/use-toast";

export interface StoredWorkflow {
  id: string;
  userId: string;
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
): StoredWorkflow | null => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    toast({
      title: "Authentication required",
      description: "Please sign in to save workflows.",
      variant: "destructive"
    });
    return null;
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
      ...workflowData,
      status,
      conversationHistory,
      updatedAt: now
    };
    
    workflows[existingIndex] = updated;
    
    // Update localStorage
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    toast({
      title: "Workflow updated",
      description: `Workflow "${workflowData.keyword}" has been updated.`,
    });
    
    return updated;
  } else {
    // Create new workflow
    const newWorkflow: StoredWorkflow = {
      id: `workflow_${Date.now()}`,
      userId: currentUser.id,
      ...workflowData,
      status,
      conversationHistory,
      createdAt: now,
      updatedAt: now
    };
    
    workflows.push(newWorkflow);
    
    // Update localStorage
    localStorage.setItem('workflows', JSON.stringify(workflows));
    
    toast({
      title: "Workflow saved",
      description: `Workflow "${workflowData.keyword}" has been saved as ${status}.`,
    });
    
    return newWorkflow;
  }
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
      workflows.push(...parsedWorkflows);
    }
  }
} catch (error) {
  console.error('Failed to load workflows from localStorage:', error);
}
