
import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkflowInfo from "../components/workflowDetail/WorkflowInfo";
import ConversationHistory from "../components/workflowDetail/ConversationHistory";
import ContactDetails from "../components/workflowDetail/ContactDetails";
import WorkflowDashboard from "../components/workflowDetail/WorkflowDashboard";

type WorkflowType = "SMS" | "Email" | "WhatsApp" | "Multi-channel";
type WorkflowStatus = "Active" | "Paused" | "Draft" | "Completed";

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  consentStatus: "Opted In" | "Pending" | "Opted Out";
}

// Sample data
const workflowData = {
  id: "wf-001",
  name: "Appointment Reminder Workflow",
  type: "Multi-channel" as WorkflowType,
  createdOn: "2025-05-01",
  lastRun: "2025-05-15",
  status: "Active" as WorkflowStatus,
  created_by: "John Doe",
  message_count: 2456,
  audience_size: 568,
};

const conversationHistory: Message[] = [
  {
    id: 1,
    sender: "ai",
    content: "Hi there! What kind of messaging workflow would you like to create today?",
    timestamp: "10:02 AM",
  },
  {
    id: 2,
    sender: "user",
    content: "I need to send appointment reminders to my clients",
    timestamp: "10:03 AM",
  },
  {
    id: 3,
    sender: "ai",
    content: "Great! I can help you create an appointment reminder workflow. When would you like to send the reminders?",
    timestamp: "10:03 AM",
  },
  {
    id: 4,
    sender: "user",
    content: "24 hours before the appointment, and then a follow-up after for feedback",
    timestamp: "10:04 AM",
  },
  {
    id: 5,
    sender: "ai",
    content: "Perfect. I'll create a workflow that sends an SMS reminder 24 hours before each appointment, and then an email 2 hours after the appointment requesting feedback. Would you like to add any other steps or conditions?",
    timestamp: "10:05 AM",
  },
  {
    id: 6,
    sender: "user",
    content: "What if they need to cancel or reschedule?",
    timestamp: "10:06 AM",
  },
  {
    id: 7,
    sender: "ai",
    content: "Good point! I'll add a condition that checks for cancellation or reschedule replies. If a client responds with keywords like 'cancel' or 'reschedule', we can send them a link to your booking page. How does that sound?",
    timestamp: "10:07 AM",
  },
  {
    id: 8,
    sender: "user",
    content: "That's perfect!",
    timestamp: "10:08 AM",
  },
];

const contactsSmallList: Contact[] = [
  {
    id: "c1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1234567890",
    consentStatus: "Opted In",
  },
  {
    id: "c2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1234567891",
    consentStatus: "Opted In",
  },
  {
    id: "c3",
    name: "Charlie Davis",
    email: "charlie@example.com",
    phone: "+1234567892",
    consentStatus: "Opted Out",
  },
  {
    id: "c4",
    name: "Diana Rogers",
    email: "diana@example.com",
    phone: "+1234567893",
    consentStatus: "Pending",
  },
  {
    id: "c5",
    name: "Edward Wilson",
    email: "edward@example.com",
    phone: "+1234567894",
    consentStatus: "Opted In",
  },
];

const dashboardData = {
  messagesSent: 2456,
  deliveryRate: 98.5,
  openRate: 72.3,
  replyRate: 34.8,
  messagesOverTime: [
    { date: "May 1", sent: 350, delivered: 345, opened: 280 },
    { date: "May 2", sent: 275, delivered: 270, opened: 210 },
    { date: "May 3", sent: 390, delivered: 385, opened: 290 },
    { date: "May 4", sent: 320, delivered: 315, opened: 240 },
    { date: "May 5", sent: 410, delivered: 405, opened: 325 },
    { date: "May 6", sent: 380, delivered: 375, opened: 290 },
    { date: "May 7", sent: 331, delivered: 325, opened: 240 },
  ],
  channelBreakdown: [
    { name: "SMS", value: 1450 },
    { name: "Email", value: 750 },
    { name: "WhatsApp", value: 256 },
  ],
};

const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("info");

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Workflow Details</h1>
          <p className="text-gray-600">
            View and manage all aspects of your "{workflowData.name}" workflow
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full border-b pb-px mb-8">
            <TabsTrigger value="info" className="text-lg">Workflow Info</TabsTrigger>
            <TabsTrigger value="conversation" className="text-lg">AI Conversation History</TabsTrigger>
            <TabsTrigger value="contacts" className="text-lg">Contact Details</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-lg">Workflow Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <WorkflowInfo 
              id={workflowData.id}
              name={workflowData.name}
              type={workflowData.type}
              createdOn={workflowData.createdOn}
              lastRun={workflowData.lastRun}
              status={workflowData.status}
              created_by={workflowData.created_by}
              message_count={workflowData.message_count}
              audience_size={workflowData.audience_size}
            />
          </TabsContent>
          
          <TabsContent value="conversation">
            <ConversationHistory messages={conversationHistory} />
          </TabsContent>
          
          <TabsContent value="contacts">
            <ContactDetails 
              fileName="clients-may-2025.csv"
              contactCount={contactsSmallList.length}
              uploadDate="May 1, 2025"
              contacts={contactsSmallList}
              isLargeFile={false}
            />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <WorkflowDashboard
              messagesSent={dashboardData.messagesSent}
              deliveryRate={dashboardData.deliveryRate}
              openRate={dashboardData.openRate}
              replyRate={dashboardData.replyRate}
              messagesOverTime={dashboardData.messagesOverTime}
              channelBreakdown={dashboardData.channelBreakdown}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default WorkflowDetail;
