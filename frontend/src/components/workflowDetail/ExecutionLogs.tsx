
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { getWorkflowExecutionLogs } from "../../utils/workflowStore";
import { ExecutionLogEntry } from "../../utils/types/workflow";
import { StoredWorkflow } from "../../utils/workflowStore";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ExecutionLogsProps {
  workflow: StoredWorkflow;
}

const ExecutionLogs = ({ workflow }: ExecutionLogsProps) => {
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [groupedLogs, setGroupedLogs] = useState<Record<string, ExecutionLogEntry[]>>({});
  const [activeTab, setActiveTab] = useState<string>("all");

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
    
    // Sort logs by timestamp (newest first)
    const sortedLogs = [...executionLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setLogs(sortedLogs);
    
    // Group logs by session (based on timestamp within 60 seconds and recipient)
    const grouped = groupLogsBySession(sortedLogs);
    setGroupedLogs(grouped);
  };

  // Group logs by session (assuming logs within ~60 seconds are part of same session)
  const groupLogsBySession = (logs: ExecutionLogEntry[]) => {
    const groups: Record<string, ExecutionLogEntry[]> = {};
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp).getTime();
      
      // Find if this log belongs to an existing group
      let sessionKey = log.recipient + '_' + timestamp;
      
      // Check if there's a group with the same recipient within 60 seconds
      Object.keys(groups).forEach(key => {
        if (key.startsWith(log.recipient + '_')) {
          const groupTime = parseInt(key.split('_')[1], 10);
          if (Math.abs(timestamp - groupTime) < 60 * 1000) {
            sessionKey = key;
          }
        }
      });
      
      if (!groups[sessionKey]) {
        groups[sessionKey] = [];
      }
      
      groups[sessionKey].push(log);
    });
    
    return groups;
  };

  // Filter logs based on active tab
  const getFilteredLogs = () => {
    if (activeTab === "all") return groupedLogs;
    
    const filtered: Record<string, ExecutionLogEntry[]> = {};
    
    Object.entries(groupedLogs).forEach(([key, sessionLogs]) => {
      const directionLogs = sessionLogs.filter(log => {
        if (activeTab === "incoming") return log.direction === "incoming";
        if (activeTab === "outgoing") return log.direction === "outgoing";
        return true;
      });
      
      if (directionLogs.length > 0) {
        filtered[key] = directionLogs;
      }
    });
    
    return filtered;
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

  // Get direction icon
  const getDirectionIcon = (direction?: string) => {
    if (direction === "incoming") {
      return <ArrowLeft className="h-3 w-3 text-amber-500 mr-1" />;
    } else if (direction === "outgoing") {
      return <ArrowRight className="h-3 w-3 text-green-500 mr-1" />;
    }
    return null;
  };

  const filteredLogs = getFilteredLogs();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Execution Logs</CardTitle>
        <CardDescription>
          Real-time activity logs for this workflow
        </CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 w-[300px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">No execution logs yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Test your workflow above or wait for it to be triggered
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredLogs).length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-gray-500">No {activeTab} logs available</p>
              </div>
            ) : (
              Object.entries(filteredLogs).map(([sessionKey, sessionLogs]) => {
                // Get the first log in the session for metadata
                const firstLog = sessionLogs[0];
                const timestamp = new Date(firstLog.timestamp);
                
                return (
                  <div key={sessionKey} className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getChannelColor(firstLog.channel)}>
                          {firstLog.channel.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-sm">
                          {firstLog.recipient}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(timestamp, "MMM d, yyyy h:mm:ss a")}
                      </span>
                    </div>
                    
                    <div className="p-3">
                      {sessionLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 py-1">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center">
                              {getDirectionIcon(log.direction)}
                              <p className="text-sm">
                                {log.message}
                                {log.provider_response && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({log.provider_response})
                                  </span>
                                )}
                              </p>
                            </div>
                            {log.personalized_content && log.personalized_content !== log.original_content && (
                              <p className="text-xs text-gray-600 ml-4 mt-1">
                                Personalized: "{log.personalized_content.length > 40 ? 
                                  log.personalized_content.substring(0, 40) + '...' : 
                                  log.personalized_content}"
                              </p>
                            )}
                            {log.error && (
                              <p className="text-xs text-red-500 ml-4">{log.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
