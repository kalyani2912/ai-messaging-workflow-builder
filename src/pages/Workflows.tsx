
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout";
import { Plus } from "lucide-react";
import { getWorkflows, StoredWorkflow } from "@/utils/workflowStore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { isAuthenticated } from "@/utils/userStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Workflows = () => {
  const [workflows, setWorkflows] = useState<StoredWorkflow[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status
    setIsLoggedIn(isAuthenticated());
    
    // Load workflows
    setWorkflows(getWorkflows());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "launched":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Workflows</h1>
            <p className="text-gray-600">
              All your messaging workflows in one place. Click on any to view details or continue the conversation.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild size="lg" className="flex items-center">
              <Link to="/create-workflow">
                <Plus className="h-5 w-5 mr-2" /> Create New Workflow
              </Link>
            </Button>
          </div>
        </div>

        {!isLoggedIn && (
          <Alert className="mb-6">
            <AlertTitle>Not Signed In</AlertTitle>
            <AlertDescription>
              Sign in to view and manage your saved workflows.
            </AlertDescription>
          </Alert>
        )}

        {isLoggedIn && workflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first workflow to get started with automated messaging.
            </p>
            <Button asChild>
              <Link to="/create-workflow">Create Workflow</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.keyword}</TableCell>
                    <TableCell>{workflow.trigger_channel}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(workflow.updatedAt)}</TableCell>
                    <TableCell>{formatDate(workflow.last_run_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" asChild size="sm">
                        <Link to={`/workflow/${workflow.id}`}>{workflow.status === 'draft' ? 'Edit' : 'View'}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Workflows;
