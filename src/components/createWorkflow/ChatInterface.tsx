
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}

interface WorkflowStep {
  id: number;
  type: "trigger" | "message" | "condition";
  description: string;
  channel?: "SMS" | "Email" | "WhatsApp";
  timing?: string;
}

interface ChatInterfaceProps {
  onUpdateWorkflow: (steps: WorkflowStep[]) => void;
}

const ChatInterface = ({ onUpdateWorkflow }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      content: "Hi there! What kind of messaging workflow would you like to create today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Example workflow steps that will be updated as the conversation progresses
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

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

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate AI response based on user input
    setTimeout(() => {
      const aiResponse = simulateAIResponse(message);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: "ai",
          content: aiResponse.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      // Update workflow steps if the AI suggests changes
      if (aiResponse.steps.length > 0) {
        const newSteps = [...workflowSteps, ...aiResponse.steps];
        setWorkflowSteps(newSteps);
        onUpdateWorkflow(newSteps);

        // Show toast for workflow update
        toast({
          title: "Workflow Updated",
          description: `Added ${aiResponse.steps.length} new step${aiResponse.steps.length > 1 ? 's' : ''} to your workflow.`,
        });
      }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Function to simulate AI responses based on user input
  const simulateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = { message: "", steps: [] as WorkflowStep[] };

    if (lowerMessage.includes("appointment") || lowerMessage.includes("remind")) {
      response.message = "Great! I'll create an appointment reminder workflow for you. It will send an SMS 24 hours before the appointment, and follow up with an email after the appointment for feedback. Would you like to add any specific instructions for customers?";
      response.steps = [
        {
          id: workflowSteps.length + 1,
          type: "trigger",
          description: "Appointment Scheduled",
        },
        {
          id: workflowSteps.length + 2,
          type: "message",
          description: "Send reminder 24hrs before appointment",
          channel: "SMS",
          timing: "T-24hrs",
        },
      ];
    } else if (lowerMessage.includes("feedback") || lowerMessage.includes("survey")) {
      response.message = "I've added a feedback request to be sent 2 hours after the appointment. This will be sent via email with a direct link to your survey form.";
      response.steps = [
        {
          id: workflowSteps.length + 1,
          type: "message",
          description: "Send feedback request after appointment",
          channel: "Email",
          timing: "T+2hrs",
        },
      ];
    } else if (lowerMessage.includes("cancel") || lowerMessage.includes("reschedule")) {
      response.message = "I'll add a condition to check if the customer cancels or wants to reschedule. If they do, we'll send them a link to reschedule at a more convenient time.";
      response.steps = [
        {
          id: workflowSteps.length + 1,
          type: "condition",
          description: "Check for cancellation/reschedule requests",
        },
        {
          id: workflowSteps.length + 2,
          type: "message",
          description: "Send reschedule link if requested",
          channel: "Email",
          timing: "Immediate",
        },
      ];
    } else {
      response.message = "I understand you want to create a messaging workflow. Could you tell me more about what type of messages you want to send? For example, appointment reminders, promotional campaigns, or customer feedback surveys?";
    }

    return response;
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
                  ? "bg-brand-blue text-white rounded-br-none"
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
          <Input
            ref={inputRef}
            type="text"
            placeholder="What would you like to automate today?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Example: "Send a reminder 1 day before appointment, then follow up for feedback"
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
