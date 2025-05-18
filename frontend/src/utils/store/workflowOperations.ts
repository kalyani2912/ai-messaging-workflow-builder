import { toast } from "../../hooks/use-toast";
import { ConversationItem, StoredWorkflow, WorkflowData } from "./workflowTypes";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Save or launch a workflow
export const saveWorkflow = async (
  workflowData: WorkflowData,
  status: "draft" | "launched",
  conversationHistory: ConversationItem[]
): Promise<StoredWorkflow | null> => {
  try {
    const res = await fetch(`${API_BASE}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowData, status, conversationHistory }),
    });
    if (!res.ok) throw new Error("Failed to save workflow");
    const saved: StoredWorkflow = await res.json();
    toast({
      title: status === "launched" ? "Workflow launched" : "Workflow saved",
      description: `Workflow "${saved.keyword}" has been ${status === "launched" ? "launched" : "saved as draft"}.`,
    });
    return saved;
  } catch (err) {
    console.error("saveWorkflow error:", err);
    toast({
      title: "Error",
      description: `Could not ${status === "launched" ? "launch" : "save"} workflow.`,
      variant: "destructive",
    });
    return null;
  }
};

// Get all workflows for the current user
export const getWorkflows = async (): Promise<StoredWorkflow[]> => {
  try {
    const res = await fetch(`${API_BASE}/workflows`);
    if (!res.ok) throw new Error("Failed to fetch workflows");
    return await res.json();
  } catch (err) {
    console.error("getWorkflows error:", err);
    toast({
      title: "Error",
      description: "Could not load workflows.",
      variant: "destructive",
    });
    return [];
  }
};

// Get a single workflow by ID
export const getWorkflowById = async (id: string): Promise<StoredWorkflow | null> => {
  try {
    const res = await fetch(`${API_BASE}/workflows/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch workflow");
    return await res.json();
  } catch (err) {
    console.error("getWorkflowById error:", err);
    toast({
      title: "Error",
      description: "Could not load workflow details.",
      variant: "destructive",
    });
    return null;
  }
};

// Delete a workflow
export const deleteWorkflow = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/workflows/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete workflow");
    toast({
      title: "Workflow deleted",
      description: "The workflow has been deleted.",
    });
    return true;
  } catch (err) {
    console.error("deleteWorkflow error:", err);
    toast({
      title: "Error",
      description: "Could not delete workflow.",
      variant: "destructive",
    });
    return false;
  }
};
