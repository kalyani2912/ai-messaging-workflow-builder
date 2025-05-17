
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { StoredWorkflow } from '@/utils/workflowStore';

interface WorkflowDashboardProps {
  workflow: StoredWorkflow;
}

const COLORS = ['#3B82F6', '#0EA5E9', '#6366F1', '#8B5CF6'];

const WorkflowDashboard = ({ workflow }: WorkflowDashboardProps) => {
  // Mock data based on the real workflow
  const messagesSent = workflow.execution_log?.length || 0;
  const deliveryRate = messagesSent > 0 ? 95 : 0; // Mock delivery rate
  const openRate = messagesSent > 0 ? 60 : 0;     // Mock open rate
  const replyRate = messagesSent > 0 ? 12 : 0;    // Mock reply rate
  
  // Generate mock data for messages over time
  const messagesOverTime = [
    {
      date: "Mon",
      sent: messagesSent > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      delivered: messagesSent > 0 ? Math.floor(Math.random() * 8) + 1 : 0,
      opened: messagesSent > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    },
    {
      date: "Tue",
      sent: messagesSent > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      delivered: messagesSent > 0 ? Math.floor(Math.random() * 8) + 1 : 0,
      opened: messagesSent > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    },
    {
      date: "Wed",
      sent: messagesSent > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      delivered: messagesSent > 0 ? Math.floor(Math.random() * 8) + 1 : 0,
      opened: messagesSent > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    },
    {
      date: "Thu",
      sent: messagesSent > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      delivered: messagesSent > 0 ? Math.floor(Math.random() * 8) + 1 : 0,
      opened: messagesSent > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    },
    {
      date: "Fri",
      sent: messagesSent > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
      delivered: messagesSent > 0 ? Math.floor(Math.random() * 8) + 1 : 0,
      opened: messagesSent > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    },
  ];
  
  // Generate mock channel breakdown
  const channels = workflow.channels || [workflow.trigger_channel];
  const channelBreakdown = channels.map(channel => ({
    name: channel,
    value: messagesSent > 0 ? Math.floor((Math.random() * messagesSent) + 1) : 0,
  }));

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h3 className="text-lg font-semibold">Performance Dashboard</h3>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Messages Sent</p>
          <p className="text-2xl font-semibold">{messagesSent.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Delivery Rate</p>
          <p className="text-2xl font-semibold">{deliveryRate}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Open Rate</p>
          <p className="text-2xl font-semibold">{openRate}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Reply Rate</p>
          <p className="text-2xl font-semibold">{replyRate}%</p>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-md font-medium mb-4">Messages Over Time</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={messagesOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#3B82F6" name="Sent" />
              <Bar dataKey="delivered" fill="#0EA5E9" name="Delivered" />
              <Bar dataKey="opened" fill="#6366F1" name="Opened" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-4">Channel Breakdown</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} messages`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;
