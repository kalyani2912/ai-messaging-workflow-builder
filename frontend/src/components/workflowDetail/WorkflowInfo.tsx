
import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar, MessageSquare, Send } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "../ui/dialog";
import { Input } from "../ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { StoredWorkflow } from "../../utils/workflowStore";
import { format } from "date-fns";

// Export the type so it can be used in other files
export type WorkflowType = "SMS" | "Email" | "WhatsApp" | "Messenger" | "Multi-channel";
export type WorkflowStatus = "active" | "draft" | "completed" | "paused";

export interface WorkflowInfoProps {
  workflow: StoredWorkflow;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-amber-100 text-amber-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <Send className="h-4 w-4 mr-1" />;
    case "paused":
      return <Calendar className="h-4 w-4 mr-1" />;
    case "draft":
      return <MessageSquare className="h-4 w-4 mr-1" />;
    case "completed":
      return <Calendar className="h-4 w-4 mr-1" />;
    default:
      return <MessageSquare className="h-4 w-4 mr-1" />;
  }
};

const WorkflowInfo = ({ workflow }: WorkflowInfoProps) => {
  const [workflowName, setWorkflowName] = useState(workflow.keyword);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(workflow.status as WorkflowStatus);
  
  // Format workflow status for display
  const formattedStatus = workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1);
  
  // Calculate workflow type based on channels
  const getWorkflowType = () => {
    const channels = workflow.channels || [workflow.trigger_channel];
    if (channels.length > 1) return "Multi-channel";
    return channels[0] || "SMS";
  };

  return (
    <div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h2 className="text-2xl font-semibold mb-2 md:mb-0">{workflowName}</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Workflow</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="workflow-name" className="text-sm font-medium">
                    Workflow Name
                  </label>
                  <Input 
                    id="workflow-name" 
                    value={workflowName} 
                    onChange={(e) => setWorkflowName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="workflow-status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select 
                    value={workflowStatus} 
                    onValueChange={(value: WorkflowStatus) => setWorkflowStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Save Changes</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 md:gap-x-6 mb-8">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Workflow ID</p>
            <p>{workflow.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
            <p>{getWorkflowType()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(workflow.status)}`}>
                {getStatusIcon(workflow.status)}
                {formattedStatus}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Created On</p>
            <p>{format(new Date(workflow.createdAt), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Last Run</p>
            <p>{workflow.last_run_at ? format(new Date(workflow.last_run_at), "MMM d, yyyy") : 'Never'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Created By</p>
            <p>{workflow.userId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Messages Sent</p>
            <p className="text-2xl font-semibold">
              {(workflow.execution_log?.length || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">Audience Size</p>
            <p className="text-2xl font-semibold">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
