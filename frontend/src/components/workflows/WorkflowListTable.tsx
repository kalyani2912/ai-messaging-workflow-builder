
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { Button } from "../ui/button";

type WorkflowType = "SMS" | "Email" | "WhatsApp" | "Multi-channel";
type WorkflowStatus = "Active" | "Paused" | "Draft" | "Completed";

interface Workflow {
  id: string;
  name: string;
  type: WorkflowType;
  createdOn: string;
  lastRun: string;
  status: WorkflowStatus;
}

// Sample data
const sampleWorkflows: Workflow[] = [
  {
    id: "wf-001",
    name: "Appointment Reminder",
    type: "SMS",
    createdOn: "2025-05-01",
    lastRun: "2025-05-15",
    status: "Active",
  },
  {
    id: "wf-002",
    name: "Monthly Newsletter",
    type: "Email",
    createdOn: "2025-04-15",
    lastRun: "2025-05-10",
    status: "Active",
  },
  {
    id: "wf-003",
    name: "Abandoned Cart Recovery",
    type: "Multi-channel",
    createdOn: "2025-03-22",
    lastRun: "2025-04-30",
    status: "Paused",
  },
  {
    id: "wf-004",
    name: "Event Registration Confirmation",
    type: "Email",
    createdOn: "2025-05-05",
    lastRun: "Never",
    status: "Draft",
  },
  {
    id: "wf-005",
    name: "Customer Feedback Survey",
    type: "WhatsApp",
    createdOn: "2025-02-10",
    lastRun: "2025-05-12",
    status: "Active",
  },
  {
    id: "wf-006",
    name: "Holiday Promotion",
    type: "Multi-channel",
    createdOn: "2025-01-15",
    lastRun: "2025-01-20",
    status: "Completed",
  },
];

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

const WorkflowListTable = () => {
  const [workflows] = useState<Workflow[]>(sampleWorkflows);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created On</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <TableRow key={workflow.id}>
              <TableCell className="font-medium">{workflow.name}</TableCell>
              <TableCell>{workflow.type}</TableCell>
              <TableCell>{workflow.createdOn}</TableCell>
              <TableCell>{workflow.lastRun}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" asChild size="sm">
                  <Link to={`/workflow/${workflow.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkflowListTable;
