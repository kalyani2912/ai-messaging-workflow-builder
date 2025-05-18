import { toast } from "../../hooks/use-toast";
import { ExecutableWorkflow, ExecutionLogEntry } from "../types/workflow";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 1. Fetch all active executable workflows from backend
export const getActiveWorkflows = async (): Promise<ExecutableWorkflow[]> => {
  try {
    const res = await fetch(`${API_BASE}/workflows/active`);
    if (!res.ok) throw new Error("Failed to load active workflows");
    return await res.json();
  } catch (err) {
    console.error("getActiveWorkflows error:", err);
    toast({ title: "Error", description: "Could not fetch active workflows.", variant: "destructive" });
    return [];
  }
};

// 2. Append a log entry to a workflow (backend will persist it)
export const updateWorkflowExecutionLog = async (
  workflowId: string,
  logEntry: ExecutionLogEntry
): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/workflows/${workflowId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry),
    });
    if (!res.ok) throw new Error("Failed to save execution log");
  } catch (err) {
    console.error("updateWorkflowExecutionLog error:", err);
    toast({ title: "Error", description: "Could not update workflow log.", variant: "destructive" });
  }
};

// 3. Retrieve execution logs for a single workflow
export const getWorkflowExecutionLogs = async (
  workflowId: string
): Promise<ExecutionLogEntry[]> => {
  try {
    const res = await fetch(`${API_BASE}/workflows/${workflowId}/logs`);
    if (!res.ok) throw new Error("Failed to load execution logs");
    return await res.json();
  } catch (err) {
    console.error("getWorkflowExecutionLogs error:", err);
    toast({ title: "Error", description: "Could not fetch workflow logs.", variant: "destructive" });
    return [];
  }
};
