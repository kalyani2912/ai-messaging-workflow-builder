
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { getWorkflowExecutionLogs } from "@/utils/workflowStore";
import { ExecutionLogEntry } from "@/utils/openAiApi";
import { StoredWorkflow } from "@/utils/workflowStore";

interface ExecutionLogsProps {
  workflow: StoredWorkflow;
}

const ExecutionLogs = ({ workflow }: ExecutionLogsProps) => {
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  useEffect(() => {
    // Load logs initially
    updateLogs();
    
    // Set up polling for new logs
    const interval = window.setInterval(updateLogs, 2000);
    setPollingInterval(interval);
    
    return () => {
      if (pollingInterval) {
        window.clearInterval(pollingInterval);
      }
    };
  }, [workflow.id]);

  const updateLogs = () => {
    const executionLogs = getWorkflowExecutionLogs(workflow.id);
    setLogs([...executionLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  // Only show for active workflows
  if (workflow.status !== 'active') {
    return null;
  }

  // Get channel badge color
  const getChannelColor = (channel: string) => {
    switch(channel.toLowerCase()) {
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'messenger': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Execution Logs</CardTitle>
        <CardDescription>
          Recent activity for this workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">No execution logs yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Logs will appear here when your workflow is triggered
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={index} className="border rounded-md p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getChannelColor(log.channel)}>
                    {log.channel.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {log.status === 'success' ? 'Success' : 'Error'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {log.message}
                      {log.recipient ? ` • To: ${log.recipient}` : ''}
                    </p>
                    {log.error && (
                      <p className="text-xs text-red-500 mt-1">{log.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
