
import { useState } from "react";
import Layout from "../components/Layout";
import { Separator } from "@/components/ui/separator";
import ChatInterface from "../components/createWorkflow/ChatInterface";
import WorkflowPreview from "../components/createWorkflow/WorkflowPreview";
import { WorkflowData } from "@/utils/huggingFaceApi";

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp" | "Messenger";
  timing?: string;
}

const CreateWorkflow = () => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  const handleUpdateWorkflow = (steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create New Workflow</h1>
          <p className="text-gray-600">
            Describe what you want to automate, and our AI will build your workflow in real-time.
          </p>
        </div>
        
        <Separator className="mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-[calc(100vh-250px)] min-h-[500px] border rounded-lg overflow-hidden shadow-sm">
          {/* Chat interface takes 75% */}
          <div className="lg:col-span-3 h-full">
            <ChatInterface onUpdateWorkflow={handleUpdateWorkflow} />
          </div>
          
          {/* Workflow preview takes 25% */}
          <div className="lg:col-span-1 h-full">
            <WorkflowPreview steps={workflowSteps} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateWorkflow;
