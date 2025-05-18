
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { getWorkflowById, deleteWorkflow, StoredWorkflow } from "../utils/workflowStore";
import WorkflowInfo from "../components/workflowDetail/WorkflowInfo";
import WorkflowDashboard from "../components/workflowDetail/WorkflowDashboard";
import ConversationHistory from "../components/workflowDetail/ConversationHistory";
import WebhookSimulator from "../components/workflowDetail/WebhookSimulator";
import ExecutionLogs from "../components/workflowDetail/ExecutionLogs";

const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<StoredWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const workflowData = getWorkflowById(id);
      if (workflowData) {
        setWorkflow(workflowData);
      } else {
        setError("Workflow not found");
      }
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    if (id && window.confirm("Are you sure you want to delete this workflow?")) {
      const deleted = deleteWorkflow(id);
      if (deleted) {
        navigate("/workflows");
      } else {
        setError("Failed to delete workflow");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || !workflow) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Workflow not found"}</AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link to="/workflows">Back to Workflows</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <Button variant="ghost" size="icon" asChild className="mb-2">
              <Link to="/workflows">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{workflow.keyword}</h1>
            <p className="text-gray-500">
              {workflow.workflow_type === 'keyword_trigger' ? 'Keyword Trigger Automation' : 'Appointment Reminder'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <Button variant="outline" onClick={handleDelete}>Delete</Button>
            <Button asChild>
              <Link to={workflow.status === 'draft' ? `/create-workflow` : '#'}>
                {workflow.status === 'draft' ? 'Edit' : 'Duplicate'}
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info & Simulator */}
          <div className="lg:col-span-1 space-y-6">
            <WebhookSimulator workflow={workflow} />
            <WorkflowInfo workflow={workflow} />
          </div>

          {/* Right Column - Dashboard & Logs */}
          <div className="lg:col-span-2 space-y-8">
            <WorkflowDashboard workflow={workflow} />
            <ExecutionLogs workflow={workflow} />
            <ConversationHistory workflow={workflow} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkflowDetail;
