
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkflowInfo from "../components/workflowDetail/WorkflowInfo";
import ConversationHistory from "../components/workflowDetail/ConversationHistory";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getWorkflowById, StoredWorkflow } from "@/utils/workflowStore";
import ChatInterface from "../components/createWorkflow/ChatInterface";
import WorkflowPreview from "../components/createWorkflow/WorkflowPreview";

// Import WorkflowType from WorkflowInfo instead of defining it here
import type { WorkflowInfoProps, WorkflowType } from "../components/workflowDetail/WorkflowInfo";

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp" | "Messenger";
  timing?: string;
}

const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("info");
  const [workflow, setWorkflow] = useState<StoredWorkflow | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const workflowData = getWorkflowById(id);
      if (workflowData) {
        setWorkflow(workflowData);
        
        // Initialize workflow steps based on the stored workflow
        const steps: WorkflowStep[] = [];
        
        if (workflowData.keyword && workflowData.trigger_channel) {
          steps.push({
            id: 1,
            type: "trigger",
            description: `Keyword '${workflowData.keyword}' received via ${workflowData.trigger_channel}`,
          });
        }
        
        if (workflowData.message.content) {
          steps.push({
            id: 2,
            type: "message",
            description: workflowData.message.content,
            channel: workflowData.trigger_channel as "SMS" | "Email" | "WhatsApp" | "Messenger",
            timing: workflowData.message.delay || "Immediate",
          });
        }
        
        if (workflowData.status) {
          steps.push({
            id: 3,
            type: "condition",
            description: `Workflow ${workflowData.status}`,
          });
        }
        
        setWorkflowSteps(steps);
      } else {
        setError("Workflow not found.");
      }
      setLoading(false);
    }
  }, [id]);

  const handleUpdateWorkflow = (steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <p>Loading workflow...</p>
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
            <AlertDescription>{error || "Failed to load workflow."}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/workflows")} className="mt-4">
            Back to Workflows
          </Button>
        </div>
      </Layout>
    );
  }

  // Convert the trigger_channel string to a WorkflowType, ensuring it matches the expected type
  const mapChannelToType = (channel: string): WorkflowType => {
    if (["SMS", "Email", "WhatsApp", "Messenger", "Multi-channel"].includes(channel)) {
      return channel as WorkflowType;
    }
    // Default fallback if the stored value doesn't match expected types
    return "Multi-channel";
  };

  const workflowType = mapChannelToType(workflow.trigger_channel);

  return (
    <Layout>
      <div className="container mx-auto py-6 flex flex-col h-[calc(100vh-64px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Workflow: {workflow.keyword}</h1>
          <p className="text-gray-600">
            Status: <span className={workflow.status === 'launched' ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {workflow.status === 'launched' ? 'Launched' : 'Draft'}
            </span>
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full border-b pb-px mb-6">
            <TabsTrigger value="info" className="text-lg">Workflow Info</TabsTrigger>
            <TabsTrigger value="conversation" className="text-lg">AI Conversation History</TabsTrigger>
            <TabsTrigger value="edit" className="text-lg">Edit Workflow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="flex-1">
            <WorkflowInfo 
              id={workflow.id}
              name={workflow.keyword}
              type={workflowType}
              createdOn={new Date(workflow.createdAt).toLocaleDateString()}
              lastRun={workflow.last_run_at ? new Date(workflow.last_run_at).toLocaleDateString() : "—"}
              status={workflow.status === 'launched' ? 'Active' : 'Draft'}
              created_by="You"
              message_count={0}
              audience_size={0}
            />
          </TabsContent>
          
          <TabsContent value="conversation" className="flex-1">
            <ConversationHistory messages={workflow.conversationHistory} />
          </TabsContent>
          
          <TabsContent value="edit" className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0 border rounded-lg shadow-sm overflow-hidden">
              {/* Chat interface takes 75% */}
              <div className="lg:col-span-3 h-full overflow-hidden">
                <ChatInterface onUpdateWorkflow={handleUpdateWorkflow} initialWorkflow={workflow} />
              </div>
              
              {/* Workflow preview takes 25% - set position sticky */}
              <div className="lg:col-span-1 h-full overflow-hidden sticky top-0 bg-gray-50 border-l">
                <WorkflowPreview steps={workflowSteps} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default WorkflowDetail;
