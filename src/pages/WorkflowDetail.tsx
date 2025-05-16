
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

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Workflow: {workflow.keyword}</h1>
          <p className="text-gray-600">
            Status: <span className={workflow.status === 'launched' ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {workflow.status === 'launched' ? 'Launched' : 'Draft'}
            </span>
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full border-b pb-px mb-8">
            <TabsTrigger value="info" className="text-lg">Workflow Info</TabsTrigger>
            <TabsTrigger value="conversation" className="text-lg">AI Conversation History</TabsTrigger>
            <TabsTrigger value="edit" className="text-lg">Edit Workflow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <WorkflowInfo 
              id={workflow.id}
              name={workflow.keyword}
              type={workflow.trigger_channel}
              createdOn={new Date(workflow.createdAt).toLocaleDateString()}
              lastRun={new Date(workflow.updatedAt).toLocaleDateString()}
              status={workflow.status === 'launched' ? 'Active' : 'Draft'}
              created_by="You"
              message_count={0}
              audience_size={0}
            />
          </TabsContent>
          
          <TabsContent value="conversation">
            <ConversationHistory messages={workflow.conversationHistory} />
          </TabsContent>
          
          <TabsContent value="edit">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-[calc(100vh-250px)] min-h-[500px] border rounded-lg overflow-hidden shadow-sm">
              {/* Chat interface takes 75% */}
              <div className="lg:col-span-3 h-full">
                <ChatInterface onUpdateWorkflow={handleUpdateWorkflow} initialWorkflow={workflow} />
              </div>
              
              {/* Workflow preview takes 25% */}
              <div className="lg:col-span-1 h-full">
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
