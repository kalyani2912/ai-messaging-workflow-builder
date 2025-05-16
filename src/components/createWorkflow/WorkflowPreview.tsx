
import { ArrowDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { WorkflowData } from "@/utils/huggingFaceApi";

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp" | "Messenger";
  timing?: string;
}

interface WorkflowPreviewProps {
  steps: WorkflowStep[];
}

const getStepIcon = (type: string, channel?: string) => {
  if (type === "trigger") {
    return (
      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-brand-blue">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  } else if (type === "condition") {
    return (
      <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  } else {
    // Message type
    if (channel === "SMS") {
      return (
        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      );
    } else if (channel === "Email") {
      return (
        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (channel === "Messenger") {
      return (
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    }
  }
};

const WorkflowPreview = ({ steps }: WorkflowPreviewProps) => {
  const handleUploadContacts = () => {
    toast({
      title: "Contact Upload",
      description: "Contact upload feature would be implemented here.",
    });
  };

  const handleLaunchCampaign = () => {
    toast({
      title: "Campaign Launched",
      description: "Your workflow has been saved and is ready to launch!",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l">
      <div className="p-4 border-b bg-white">
        <h3 className="text-lg font-medium">Workflow Preview</h3>
        <p className="text-sm text-gray-500">
          Watch your workflow build in real-time
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {steps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No steps yet</p>
            <p className="text-sm text-gray-400">
              Start chatting to build your workflow
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-4">
                  {getStepIcon(step.type, step.channel)}
                  <div className="flex-1">
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <p className="font-medium mb-1">{step.description}</p>
                      {step.channel && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Channel: {step.channel}
                          </span>
                          {step.timing && (
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {step.timing}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-12 h-8 w-0 border-l-2 border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white space-y-2">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={handleUploadContacts}
        >
          <Upload className="h-4 w-4 mr-2" /> Upload Contacts
        </Button>
        <Button 
          className="w-full"
          disabled={steps.length === 0}
          onClick={handleLaunchCampaign}
        >
          Launch Campaign
        </Button>
      </div>
    </div>
  );
};

export default WorkflowPreview;
