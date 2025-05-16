import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAIResponse, buildSystemPrompt, validateChannelInput, WorkflowData } from "@/utils/huggingFaceApi";
import { parseCSV } from "@/utils/csvUtils";

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  onUpdateWorkflow: (steps: WorkflowStep[]) => void;
}

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp";
  timing?: string;
}

const ChatInterface = ({ onUpdateWorkflow }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      content: "Hi! What keyword should trigger this workflow? (e.g., 'DEMO', 'HELP', 'OFFER')",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Our workflow data structure
  const [workflow, setWorkflow] = useState<WorkflowData>({
    keyword: "",
    trigger_channel: "",
    message: {
      content: "",
      channel: "",
      delay: "",
    },
    contact_upload: {
      filename: "",
      total_contacts: 0,
      with_consent: 0,
      without_consent: 0,
    },
    launch_decision: "",
  });

  // Track the conversation state
  const [conversationStep, setConversationStep] = useState(0);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus the input when the component mounts
    inputRef.current?.focus();
  }, []);

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
          updatedWorkflow.trigger_channel = userInput;
        } else {
          isValid = false;
          aiResponseText = "Please use only SMS, WhatsApp, Email, or Messenger as the trigger channel.";
          nextStep = conversationStep; // Stay on the same step
        }
        break;

      case 2: // Message content
        updatedWorkflow.message.content = userInput;
        break;

      case 3: // Message channel
        if (validateChannelInput(userInput)) {
          updatedWorkflow.message.channel = userInput;
        } else {
          isValid = false;
          aiResponseText = "Please use only SMS, WhatsApp, Email, or Messenger as the message channel.";
          nextStep = conversationStep; // Stay on the same step
        }
        break;

      case 4: // Message delay
        updatedWorkflow.message.delay = userInput;
        break;

      case 5: // CSV upload - this is handled separately via file input
        nextStep = conversationStep; // Don't advance yet, wait for file upload
        aiResponseText = "Please upload your CSV file using the upload button.";
        break;

      case 6: // After upload: consent confirmation
        // This is just handling their response to consent info
        nextStep = 7; // Move to launch decision question
        break;

      case 7: // Launch decision
        updatedWorkflow.launch_decision = userInput;
        aiResponseText = `Great! Your workflow has been ${userInput.toLowerCase() === "launch" ? "launched" : "saved as draft"}.`;
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
      if (conversationStep < 5 || conversationStep >= 6) {
        try {
          // We'll update the conversation step before the API call
          setConversationStep(nextStep);
          
          if (nextStep === 5) {
            // Prompt for file upload
            addAIMessage("Please upload a CSV file (max 10MB) with Name, Phone, Email, Consent(Yes/No)");
          } else {
            // Normal AI response
            const systemPrompt = buildSystemPrompt(updatedWorkflow);
            const response = await getAIResponse(systemPrompt, userInput);
            addAIMessage(response);
          }
          
          // Update the workflow preview after responses
          updateWorkflowPreview(updatedWorkflow);
        } catch (error) {
          console.error("Error getting AI response:", error);
          addAIMessage("Sorry, I encountered an error. Please try again.");
        }
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await parseCSV(file);
      const updatedWorkflow = {
        ...workflow,
        contact_upload: {
          filename: result.filename,
          total_contacts: result.total_contacts,
          with_consent: result.with_consent,
          without_consent: result.without_consent
        }
      };
      
      setWorkflow(updatedWorkflow);
      updateWorkflowPreview(updatedWorkflow);
      
      // Add a message to show the CSV was processed
      addAIMessage(`You uploaded ${result.with_consent} contacts with valid consent and ${result.without_consent} without consent. Would you like to upload consents for the remaining ${result.without_consent} contacts?`);
      
      // Move to the next step
      setConversationStep(6);
      
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

  const updateWorkflowPreview = (workflowData: WorkflowData) => {
    // Convert workflow data to steps for preview
    const steps: WorkflowStep[] = [];
    
    // Add trigger step if keyword exists
    if (workflowData.keyword && workflowData.trigger_channel) {
      steps.push({
        id: 1,
        type: "trigger",
        description: `Keyword '${workflowData.keyword}' received via ${workflowData.trigger_channel}`,
      });
    }
    
    // Add message step if content exists
    if (workflowData.message.content && workflowData.message.channel) {
      steps.push({
        id: 2,
        type: "message",
        description: workflowData.message.content,
        channel: workflowData.message.channel as any,
        timing: workflowData.message.delay || "Immediate",
      });
    }
    
    // Add condition for consent if file is uploaded
    if (workflowData.contact_upload.filename) {
      steps.push({
        id: 3,
        type: "condition",
        description: `Send only to contacts with consent (${workflowData.contact_upload.with_consent}/${workflowData.contact_upload.total_contacts})`,
      });
    }
    
    onUpdateWorkflow(steps);
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
        <h3 className="text-lg font-medium">Create Your Workflow</h3>
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
          {conversationStep === 5 ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button 
                onClick={triggerFileUpload} 
                className="flex-1"
              >
                Upload CSV File (max 10MB)
              </Button>
            </>
          ) : (
            <>
              <Input
                ref={inputRef}
                type="text"
                placeholder={
                  conversationStep === 1 || conversationStep === 3
                    ? "Type: SMS, WhatsApp, Email, or Messenger"
                    : conversationStep === 7
                    ? "Type: Launch or Save as Draft"
                    : "Type your response..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={conversationStep > 7}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() || conversationStep > 7}>
                <Send className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {conversationStep === 0
            ? "Example: 'DEMO', 'HELP', 'PROMO'"
            : conversationStep === 1 || conversationStep === 3
            ? "Must be one of: SMS, WhatsApp, Email, Messenger"
            : conversationStep === 2
            ? "Type the message content to be sent to your contacts"
            : conversationStep === 4
            ? "Example: 'immediate', 'after 10 minutes', '1 day before appointment'"
            : conversationStep === 5
            ? "File must include Name, Phone, Email and Consent columns"
            : conversationStep === 7
            ? "Type 'Launch' or 'Save as Draft'"
            : ""
          }
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
