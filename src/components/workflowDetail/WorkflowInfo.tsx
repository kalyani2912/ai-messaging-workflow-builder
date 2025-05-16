
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Send } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type WorkflowType = "SMS" | "Email" | "WhatsApp" | "Multi-channel";
type WorkflowStatus = "Active" | "Paused" | "Draft" | "Completed";

interface WorkflowInfoProps {
  id: string;
  name: string;
  type: WorkflowType;
  createdOn: string;
  lastRun: string;
  status: WorkflowStatus;
  created_by: string;
  message_count: number;
  audience_size: number;
}

const getStatusColor = (status: WorkflowStatus) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Paused":
      return "bg-amber-100 text-amber-800";
    case "Draft":
      return "bg-gray-100 text-gray-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: WorkflowStatus) => {
  switch (status) {
    case "Active":
      return <Send className="h-4 w-4 mr-1" />;
    case "Paused":
      return <Calendar className="h-4 w-4 mr-1" />;
    case "Draft":
      return <MessageSquare className="h-4 w-4 mr-1" />;
    case "Completed":
      return <Calendar className="h-4 w-4 mr-1" />;
    default:
      return <MessageSquare className="h-4 w-4 mr-1" />;
  }
};

const WorkflowInfo = ({
  id,
  name,
  type,
  createdOn,
  lastRun,
  status,
  created_by,
  message_count,
  audience_size,
}: WorkflowInfoProps) => {
  const [workflowName, setWorkflowName] = useState(name);
  const [workflowStatus, setWorkflowStatus] = useState(status);

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
                    onValueChange={(value) => setWorkflowStatus(value as WorkflowStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
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
            <p>{id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
            <p>{type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                {status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Created On</p>
            <p>{createdOn}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Last Run</p>
            <p>{lastRun}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Created By</p>
            <p>{created_by}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Messages Sent</p>
            <p className="text-2xl font-semibold">{message_count.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">Audience Size</p>
            <p className="text-2xl font-semibold">{audience_size.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
