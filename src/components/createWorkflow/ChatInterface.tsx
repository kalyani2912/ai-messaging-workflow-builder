
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  getAIResponse, 
  buildSystemPrompt, 
  validateChannelInput, 
  normalizeChannelInput, 
  WorkflowData,
  getWorkflowVisualization
} from "@/utils/huggingFaceApi";
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

  // Our workflow data structure
  const [workflow, setWorkflow] = useState<WorkflowData>({
    keyword: initialWorkflow?.keyword || "",
    trigger_channel: initialWorkflow?.trigger_channel || "",
    message: {
      content: initialWorkflow?.message.content || "",
      delay: initialWorkflow?.message.delay || "",
    },
    launch_decision: initialWorkflow?.status || "",
  });

  // Track the conversation state
  const [conversationStep, setConversationStep] = useState(0);
  const [isProcessingWorkflow, setIsProcessingWorkflow] = useState(false);
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);

  useEffect(() => {
    // Set up initial messages
    if (initialWorkflow) {
      // This is an existing workflow - load the conversation history
      setMessages(initialWorkflow.conversationHistory);
      
      // Determine which step we're at
      if (initialWorkflow.status === 'launched' || initialWorkflow.status === 'draft') {
        setConversationStep(5); // Completed all steps
        setIsWorkflowComplete(true);
      } else if (initialWorkflow.message.delay) {
        setConversationStep(4); // Needs launch decision
      } else if (initialWorkflow.message.content) {
        setConversationStep(3); // Needs delay
      } else if (initialWorkflow.trigger_channel) {
        setConversationStep(2); // Needs message content
      } else if (initialWorkflow.keyword) {
        setConversationStep(1); // Needs trigger channel
      } else {
        setConversationStep(0); // Fresh start
      }
    } else {
      // This is a new workflow - start with the first question
      setMessages([{
        id: 1,
        sender: "ai",
        content: "Hi! What keyword should trigger this workflow? (e.g., 'DEMO', 'HELP', 'OFFER')",
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
      if (workflow.keyword || workflow.trigger_channel || workflow.message.content) {
        try {
          // Only call visualization API if we have meaningful content
          const visualization = await getWorkflowVisualization(workflow);
          
          // Convert the visualization text to workflow steps
          const steps = visualizationToSteps(visualization, workflow);
          onUpdateWorkflow(steps);
        } catch (error) {
          console.error("Error updating workflow visualization:", error);
        }
      }
    };
    
    updateVisualization();
  }, [workflow, onUpdateWorkflow]);

  // Helper function to convert visualization text to workflow steps
  const visualizationToSteps = (visualization: string, workflow: WorkflowData): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];
    
    // Add trigger step if keyword exists
    if (workflow.keyword && workflow.trigger_channel) {
      steps.push({
        id: 1,
        type: "trigger",
        description: `Keyword '${workflow.keyword}' received via ${workflow.trigger_channel}`,
      });
    }
    
    // Add message step if content exists
    if (workflow.message.content) {
      steps.push({
        id: 2,
        type: "message",
        description: workflow.message.content,
        channel: workflow.trigger_channel as any,
        timing: workflow.message.delay || "Immediate",
      });
    }
    
    // Add launch decision if it exists
    if (workflow.launch_decision) {
      steps.push({
        id: 3,
        type: "condition",
        description: `Workflow ${workflow.launch_decision.toLowerCase() === "launched" ? "launched" : "saved as draft"}`,
      });
    }
    
    return steps;
  };

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
    processUserInput(currentMessage);
  };

  const processUserInput = async (userInput: string) => {
    let updatedWorkflow = { ...workflow };
    let nextStep = conversationStep + 1;
    let aiResponseText = "";
    let isValid = true;

    // Handle different conversation steps
    switch (conversationStep) {
      case 0: // Keyword
        updatedWorkflow.keyword = userInput;
        break;

      case 1: // Trigger channel
        if (validateChannelInput(userInput)) {
          updatedWorkflow.trigger_channel = normalizeChannelInput(userInput);
        } else {
          isValid = false;
          aiResponseText = "Please enter one of the allowed channels: SMS, WhatsApp, Email, or Messenger.";
          nextStep = conversationStep; // Stay on the same step
        }
        break;

      case 2: // Message content
        updatedWorkflow.message.content = userInput;
        break;

      case 3: // Message delay
        updatedWorkflow.message.delay = userInput;
        // Mark workflow as complete to show save buttons
        setIsWorkflowComplete(true);
        break;

      default:
        aiResponseText = "Thank you for using our workflow builder.";
        break;
    }

    // Update workflow state
    setWorkflow(updatedWorkflow);

    // If we need to show a custom message (for validation failures)
    if (!isValid && aiResponseText) {
      addAIMessage(aiResponseText);
    } else {
      // Otherwise, get AI response based on updated workflow
      try {
        // We'll update the conversation step before the API call
        setConversationStep(nextStep);
        
        if (nextStep > 3) {
          // We're done with the questions
          if (!aiResponseText) {
            addAIMessage("Your workflow is now complete. You can launch it now or save it as a draft.");
          }
        } else {
          // Normal AI response - use the new system prompt
          const systemPrompt = buildSystemPrompt();
          const response = await getAIResponse(systemPrompt, userInput);
          addAIMessage(response);
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
        addAIMessage("Sorry, I encountered an error. Please try again.");
      }
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
      addAIMessage(`You uploaded ${result.with_consent} contacts with valid consent and ${result.without_consent} without consent. Would you like to upload consents for the remaining ${result.without_consent} contacts?`);
      
    } catch (error) {
      console.error("File upload error:", error);
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
      
      {/* Use position-relative for the scroll area container to ensure scrollbar appears within it */}
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
            <div className="flex space-x-2">
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    conversationStep === 1
                      ? "Type: SMS, WhatsApp, Email, or Messenger"
                      : "Type your response..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  disabled={isProcessingWorkflow}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim() || isProcessingWorkflow}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {conversationStep === 0
                ? "Example: 'DEMO', 'HELP', 'PROMO'"
                : conversationStep === 1
                ? "Must be one of: SMS, WhatsApp, Email, Messenger"
                : conversationStep === 2
                ? "Type the message content to be sent when the keyword is triggered"
                : conversationStep === 3
                ? "Example: 'immediate', 'after 10 minutes', '1 day before appointment'"
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
