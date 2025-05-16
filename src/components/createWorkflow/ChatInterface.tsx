
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, FileDown, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  getAIResponse, 
  buildSystemPrompt, 
  WorkflowData,
  generateContextualPrompt,
} from "@/utils/openAiApi";
import { 
  initializeWorkflowState,
  getNextStep,
  updateWorkflowData,
  isWorkflowComplete,
  generateWorkflowSteps,
  generateSampleCSV
} from "@/utils/workflowSlotController";
import { parseCSV } from "@/utils/csvUtils";
import { saveWorkflow, StoredWorkflow } from "@/utils/workflowStore";
import { isAuthenticated } from "@/utils/userStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  onUpdateWorkflow: (steps: WorkflowStep[]) => void;
  initialWorkflow?: StoredWorkflow;
}

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp" | "Messenger";
  timing?: string;
}

const ChatInterface = ({ onUpdateWorkflow, initialWorkflow }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'launched' | 'draft' | null>(null);
  const [isProcessingWorkflow, setIsProcessingWorkflow] = useState(false);
  
  // Initialize workflow state controller
  const [workflowState, setWorkflowState] = useState(initializeWorkflowState());
  const [currentStep, setCurrentStep] = useState("workflow_type_selection");
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);

  // Our workflow data structure
  const [workflow, setWorkflow] = useState<WorkflowData>({
    workflow_type: initialWorkflow?.workflow_type,
    keyword: initialWorkflow?.keyword || "",
    trigger_channel: initialWorkflow?.trigger_channel || "",
    message: {
      content: initialWorkflow?.message?.content || "",
      delay: initialWorkflow?.message?.delay || "",
    },
    launch_decision: initialWorkflow?.status || "",
  });

  useEffect(() => {
    // Set up initial messages
    if (initialWorkflow) {
      // This is an existing workflow - load the conversation history
      setMessages(initialWorkflow.conversationHistory);
      
      // Set the workflow as complete if it has a status
      if (initialWorkflow.status === 'launched' || initialWorkflow.status === 'draft') {
        setIsWorkflowComplete(true);
        setCurrentStep("end");
      }
    } else {
      // This is a new workflow - start with the first question
      const firstPrompt = generateContextualPrompt(
        "workflow_type_selection", 
        workflow, 
        workflowState.steps
      );
      
      setMessages([{
        id: 1,
        sender: "ai",
        content: firstPrompt,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  }, [initialWorkflow]);

  // Add scroll event listener to detect manual scrolling
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    if (!scrollArea) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      // If user has scrolled up, disable auto-scroll
      // If user has scrolled to bottom, enable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      setIsAutoScrollEnabled(isNearBottom);
    };
    
    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to scroll to bottom only when enabled
  useEffect(() => {
    if (isAutoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAutoScrollEnabled]);

  useEffect(() => {
    // Focus the input when the component mounts
    inputRef.current?.focus();
  }, []);

  // Effect to update the visualization whenever workflow changes
  useEffect(() => {
    const updateVisualization = async () => {
      if (workflow.keyword || workflow.workflow_type) {
        const steps = generateWorkflowSteps(workflow);
        onUpdateWorkflow(steps);
      }
    };
    
    updateVisualization();
  }, [workflow, onUpdateWorkflow]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentMessage = message;
    setMessage("");

    // Process user input based on current conversation step
    await processUserInput(currentMessage);
  };

  const processUserInput = async (userInput: string) => {
    // Update workflow data based on the current step
    const updatedWorkflow = updateWorkflowData(workflow, currentStep, userInput);
    setWorkflow(updatedWorkflow);
    
    // Determine the next step
    const nextStep = getNextStep(workflowState, currentStep, userInput);
    
    // Check if the workflow is completed
    if (nextStep === "end") {
      setIsWorkflowComplete(true);
      addAIMessage("Your workflow is now complete. You can launch it now or save it as a draft.");
      return;
    }
    
    // Update the current step
    setCurrentStep(nextStep);
    
    try {
      // Generate the prompt for the next step
      const nextPrompt = generateContextualPrompt(nextStep, updatedWorkflow, workflowState.steps);
      
      // Special handling for file upload step
      if (nextStep === "appointment_reminder.csv_uploaded") {
        addAIMessage(nextPrompt);
      } else {
        // Get AI response for normal steps
        const systemPrompt = buildSystemPrompt();
        const contextPrompt = `Current workflow state: ${JSON.stringify(updatedWorkflow)}\nCurrent step: ${nextStep}`;
        
        const response = await getAIResponse(systemPrompt, nextPrompt, contextPrompt);
        addAIMessage(response);
      }
    } catch (error) {
      console.error("Error processing user input:", error);
      addAIMessage("Sorry, I encountered an error. Please try again.");
    }
  };

  const handleWorkflowAction = (action: 'launched' | 'draft') => {
    if (!isAuthenticated()) {
      // Show the auth dialog if user is not authenticated
      setPendingAction(action);
      setShowAuthDialog(true);
      return;
    }

    // User is authenticated, proceed with saving
    saveWorkflowToStore(action);
  };

  const saveWorkflowToStore = async (action: 'launched' | 'draft') => {
    setIsProcessingWorkflow(true);

    try {
      const updatedWorkflow = {
        ...workflow,
        launch_decision: action
      };

      const savedWorkflow = await saveWorkflow(
        updatedWorkflow,
        action, 
        messages
      );
      
      if (savedWorkflow) {
        toast({
          title: `Workflow ${action === 'launched' ? 'launched' : 'saved as draft'}`,
          description: "You can view and manage it in your workflow list."
        });
        
        // Redirect to workflows page
        navigate("/workflows");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        title: "Error saving workflow",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingWorkflow(false);
    }
  };

  const handleAuthAction = (action: 'signin' | 'signup') => {
    // Close dialog and navigate to sign in/up page
    setShowAuthDialog(false);
    navigate(action === 'signin' ? '/signin' : '/signup');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await parseCSV(file);
      
      // Add a message to show the CSV was processed
      addAIMessage(`CSV file "${file.name}" uploaded successfully with ${result.with_consent} contacts. What message should be sent as the appointment reminder?`);
      
      // Update workflow data to reflect CSV upload
      const updatedWorkflow = { ...workflow, csv_uploaded: true };
      setWorkflow(updatedWorkflow);
      
      // Move to the next step
      const nextStep = "appointment_reminder.reminder_message";
      setCurrentStep(nextStep);
      
    } catch (error) {
      console.error("File upload error:", error);
      addAIMessage("There was an error processing your CSV file. Please make sure it has the required headers and try again.");
    }
    
    // Clear the file input
    if (event.target) event.target.value = '';
  };

  const addAIMessage = (content: string) => {
    setMessages(prev => [
      ...prev, 
      {
        id: prev.length + 1,
        sender: "ai",
        content,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'appointment_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shouldShowFileUploadButton = currentStep === "appointment_reminder.csv_uploaded";
  const shouldShowDownloadSampleButton = currentStep === "appointment_reminder.csv_uploaded";

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-medium">
          {initialWorkflow ? `Edit Workflow: ${initialWorkflow.keyword}` : 'Create Your Workflow'}
        </h3>
        <p className="text-sm text-gray-500">
          Describe what you want, and I'll help build your messaging workflow.
        </p>
      </div>
      
      {/* Position-relative for the scroll area container */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="mb-1">{msg.content}</p>
                  <p className={`text-xs ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"} text-right`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t bg-white">
        {isWorkflowComplete ? (
          <div className="space-y-3">
            <div className="flex justify-between gap-3">
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={() => handleWorkflowAction('draft')}
                disabled={isProcessingWorkflow}
              >
                Save as Draft
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => handleWorkflowAction('launched')}
                disabled={isProcessingWorkflow}
              >
                Launch Workflow
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {isAuthenticated() 
                ? "Your workflow will be saved to your account." 
                : "Sign in to save your workflow and access it later."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {shouldShowFileUploadButton && (
              <div className="flex justify-between mb-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-1"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download Sample</span>
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={triggerFileUpload}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload CSV</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
            
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your response..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isProcessingWorkflow || shouldShowFileUploadButton}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={(!message.trim() && !shouldShowFileUploadButton) || isProcessingWorkflow}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {currentStep === "workflow_type_selection"
                ? "Enter a number (1 or 2) or type the name of the workflow you want to create"
                : currentStep === "keyword_trigger.keyword"
                ? "Example: 'DEMO', 'HELP', 'PROMO'"
                : currentStep === "keyword_trigger.channels"
                ? "Enter one or more channels separated by commas (SMS, WhatsApp, Email, Messenger)"
                : currentStep === "appointment_reminder.csv_uploaded"
                ? "Upload a CSV file with appointment and customer details"
                : ""
              }
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to sign in or create an account to save your workflow.
          </AlertDialogDescription>
          <AlertDialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => handleAuthAction('signin')} className="flex-1">Sign In</Button>
            <Button onClick={() => handleAuthAction('signup')} className="flex-1">Create Account</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatInterface;
