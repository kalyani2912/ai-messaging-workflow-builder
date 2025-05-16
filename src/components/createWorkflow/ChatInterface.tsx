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

  useEffect(() => {
    // Set up initial messages
    if (initialWorkflow) {
      // This is an existing workflow - load the conversation history
      setMessages(initialWorkflow.conversationHistory);
      
      // Determine which step we're at
      if (initialWorkflow.status === 'launched' || initialWorkflow.status === 'draft') {
        setConversationStep(5); // Completed all steps
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        description: `Workflow ${workflow.launch_decision.toLowerCase() === "launch" ? "launched" : "saved as draft"}`,
      });
    }
    
    return steps;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        break;

      case 4: // Launch decision
        updatedWorkflow.launch_decision = userInput;
        if (userInput.toLowerCase().includes("launch")) {
          updatedWorkflow.launch_decision = "launched";
        } else {
          updatedWorkflow.launch_decision = "draft";
        }
        
        aiResponseText = `Great! Your workflow has been ${updatedWorkflow.launch_decision}.`;
        
        // If the user is authenticated, save the workflow
        if (isAuthenticated()) {
          setIsProcessingWorkflow(true);
          
          try {
            const savedWorkflow = await saveWorkflow(
              updatedWorkflow, 
              updatedWorkflow.launch_decision as 'draft' | 'launched', 
              [...messages, {
                id: messages.length + 1,
                sender: "user",
                content: userInput,
                timestamp: new Date().toLocaleTimeString(),
              }]
            );
            
            if (savedWorkflow) {
              // Add a message after a short delay to give the impression of processing
              setTimeout(() => {
                addAIMessage(`Your workflow has been ${updatedWorkflow.launch_decision}. You can view and manage it in your workflow list.`);
                // Redirect to workflows page after a short delay
                setTimeout(() => {
                  navigate("/workflows");
                }, 2000);
              }, 1000);
            }
          } catch (error) {
            console.error("Error saving workflow:", error);
            addAIMessage("There was an error saving your workflow. Please try again.");
          } finally {
            setIsProcessingWorkflow(false);
          }
        } else {
          // If not authenticated, prompt to sign up or log in
          setTimeout(() => {
            addAIMessage("To save your workflow, please sign in or create an account.");
            // Add sign in/up buttons or redirect
          }, 1000);
        }
        break;

      default:
        aiResponseText = "Thank you for using our workflow builder!";
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
        
        if (nextStep > 4) {
          // We're done with the questions
          if (!aiResponseText) {
            addAIMessage("Thank you for creating this workflow! It has been processed according to your preferences.");
          }
        } else {
          // Normal AI response
          const systemPrompt = buildSystemPrompt(updatedWorkflow);
          const response = await getAIResponse(systemPrompt, userInput);
          addAIMessage(response);
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
        addAIMessage("Sorry, I encountered an error. Please try again.");
      }
    }
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
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      
      <div className="p-4 border-t">
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
                  : conversationStep === 4
                  ? "Type: Launch or Save as Draft"
                  : "Type your response..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={conversationStep > 4 || isProcessingWorkflow}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || conversationStep > 4 || isProcessingWorkflow}
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
            : conversationStep === 4
            ? "Type 'Launch' or 'Save as Draft'"
            : ""
          }
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
