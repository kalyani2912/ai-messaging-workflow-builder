
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Separator } from "@/components/ui/separator";
import ChatInterface from "../components/createWorkflow/ChatInterface";
import WorkflowPreview from "../components/createWorkflow/WorkflowPreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/utils/userStore";

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp" | "Messenger";
  timing?: string;
}

const CreateWorkflow = () => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status after a short delay to ensure UI renders first
    const timer = setTimeout(() => {
      if (!isAuthenticated()) {
        setShowAuthAlert(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateWorkflow = (steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 flex flex-col h-[calc(100vh-64px)]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">Create New Workflow</h1>
          <p className="text-gray-600">
            Describe what you want to automate, and our AI will build your workflow in real-time.
          </p>
        </div>
        
        {showAuthAlert && (
          <Alert className="mb-4">
            <AlertTitle>You're not signed in</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span>Sign in or create an account to save your workflows.</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate("/signin")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Separator className="mb-4" />
        
        {/* Fixed height container for the chat and preview with overflow hidden */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 border rounded-lg shadow-sm overflow-hidden">
          {/* Chat interface takes 75% */}
          <div className="lg:col-span-3 h-full overflow-hidden">
            <ChatInterface onUpdateWorkflow={handleUpdateWorkflow} />
          </div>
          
          {/* Workflow preview takes 25% - fixed position on larger screens */}
          <div className="lg:col-span-1 h-full overflow-hidden bg-gray-50 border-l sticky top-0">
            <WorkflowPreview steps={workflowSteps} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateWorkflow;
