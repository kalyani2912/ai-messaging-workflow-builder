import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { StoredWorkflow } from '@/utils/workflowStore';

interface WorkflowDashboardProps {
  workflow: StoredWorkflow;
}

const COLORS = ['#3B82F6', '#0EA5E9', '#6366F1', '#8B5CF6'];

const WorkflowDashboard = ({ workflow }: WorkflowDashboardProps) => {
  // Get logs and calculate metrics
  const logs = workflow.execution_log || [];
  
  // Count incoming vs outgoing messages
  const incomingCount = logs.filter(log => log.direction === 'incoming').length;
  const outgoingCount = logs.filter(log => log.direction === 'outgoing').length;
  const messagesSent = outgoingCount;
  
  // Calculate success rates
  const successCount = logs.filter(log => log.status === 'success').length;
  const errorCount = logs.filter(log => log.status === 'error').length;
  const deliveryRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0;
  
  // Other simulated metrics
  const openRate = messagesSent > 0 ? 60 : 0;     // Mock open rate
  const replyRate = messagesSent > 0 ? 12 : 0;    // Mock reply rate
  
  // Group messages by day of the week for bar chart
  const messagesByDay = generateMessagesByDay(logs);
  
  // Count messages by channel for pie chart
  const channelBreakdown = generateChannelBreakdown(logs);

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
          <p className="text-sm font-medium text-gray-500 mb-1">Messages Received</p>
          <p className="text-2xl font-semibold">{incomingCount.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Success Rate</p>
          <p className="text-2xl font-semibold">{deliveryRate}%</p>
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
            <BarChart data={messagesByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="incoming" fill="#F59E0B" name="Incoming" />
              <Bar dataKey="outgoing" fill="#3B82F6" name="Outgoing" />
              <Bar dataKey="successful" fill="#10B981" name="Successful" />
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

// Helper function to generate message data by day
const generateMessagesByDay = (logs: any[]) => {
  if (!logs || logs.length === 0) {
    return generateEmptyWeekData();
  }
  
  // Map days of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create a map to store counts by day
  const dayMap: Record<string, {incoming: number, outgoing: number, successful: number}> = {};
  
  // Initialize all days
  daysOfWeek.forEach(day => {
    dayMap[day] = { incoming: 0, outgoing: 0, successful: 0 };
  });
  
  // Count messages by day
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const day = daysOfWeek[date.getDay()];
    
    if (log.direction === 'incoming') {
      dayMap[day].incoming++;
    } else if (log.direction === 'outgoing') {
      dayMap[day].outgoing++;
      if (log.status === 'success') {
        dayMap[day].successful++;
      }
    }
  });
  
  // Convert map to array for chart
  return daysOfWeek.map(day => ({
    date: day,
    incoming: dayMap[day].incoming,
    outgoing: dayMap[day].outgoing,
    successful: dayMap[day].successful,
  }));
};

// Helper function to generate empty week data
const generateEmptyWeekData = () => {
  return [
    { date: 'Sun', incoming: 0, outgoing: 0, successful: 0 },
    { date: 'Mon', incoming: 0, outgoing: 0, successful: 0 },
    { date: 'Tue', incoming: 0, outgoing: 0, successful: 0 },
    { date: 'Wed', incoming: 0, outgoing: 0, successful: 0 },
    { date: 'Thu', incoming: 0, outgoing: 0, successful: 0 },
    { date: 'Fri', incoming: 0, outgoing: 0, successful: 0 },
    { date: 'Sat', incoming: 0, outgoing: 0, successful: 0 },
  ];
};

// Helper function to generate channel breakdown
const generateChannelBreakdown = (logs: any[]) => {
  if (!logs || logs.length === 0) {
    return [
      { name: 'SMS', value: 0 },
      { name: 'WhatsApp', value: 0 },
      { name: 'Email', value: 0 },
      { name: 'Messenger', value: 0 },
    ];
  }
  
  // Count by channel
  const channelCounts: Record<string, number> = {
    sms: 0,
    whatsapp: 0,
    email: 0,
    messenger: 0,
  };
  
  // Only count outgoing messages
  logs.filter(log => log.direction === 'outgoing').forEach(log => {
    const channel = log.channel.toLowerCase();
    if (channelCounts[channel] !== undefined) {
      channelCounts[channel]++;
    }
  });
  
  // Convert to chart data format
  return [
    { name: 'SMS', value: channelCounts.sms },
    { name: 'WhatsApp', value: channelCounts.whatsapp },
    { name: 'Email', value: channelCounts.email },
    { name: 'Messenger', value: channelCounts.messenger },
  ].filter(item => item.value > 0);  // Only show channels with messages
};

export default WorkflowDashboard;
