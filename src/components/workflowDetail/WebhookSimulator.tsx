
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { simulateInboundMessage } from "@/utils/webhookApi";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mail, AlertCircle, PhoneCall } from "lucide-react";
import { StoredWorkflow } from "@/utils/workflowStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WebhookSimulatorProps {
  workflow: StoredWorkflow;
}

const WebhookSimulator = ({ workflow }: WebhookSimulatorProps) => {
  const [activeTab, setActiveTab] = useState<string>("sms");
  const [senderSMS, setSenderSMS] = useState<string>("+15551234567");
  const [senderWhatsApp, setSenderWhatsApp] = useState<string>("+15551234567");
  const [senderEmail, setSenderEmail] = useState<string>("user@example.com");
  const [message, setMessage] = useState<string>(workflow.keyword || "");
  const [emailSubject, setEmailSubject] = useState<string>(workflow.keyword || "");
  const [emailBody, setEmailBody] = useState<string>("Hello, I'm interested in your service.");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  // Only show for active workflows
  if (workflow.status !== 'active') {
    return null;
  }

  const handleSimulate = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      let success = false;
      
      if (activeTab === 'sms') {
        success = await simulateInboundMessage('sms', senderSMS, message);
      } else if (activeTab === 'whatsapp') {
        success = await simulateInboundMessage('whatsapp', senderWhatsApp, message);
      } else if (activeTab === 'email') {
        success = await simulateInboundMessage('email', senderEmail, emailBody, emailSubject);
      }
      
      console.log(`Simulation result: ${success ? 'Success' : 'No matching workflows'}`);
      
      setTestResult({
        success,
        message: success 
          ? `Test successful. Check execution logs below.` 
          : `No workflow matched. Make sure your test message includes the keyword "${workflow.keyword}".`
      });
    } catch (error) {
      console.error('Simulation error:', error);
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Test Your Workflow</CardTitle>
        <CardDescription>
          Simulate an inbound message to test your workflow in real-time
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="sms" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="sms" disabled={!workflow.trigger.channels.includes('SMS')}>
              <PhoneCall className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="whatsapp" disabled={!workflow.trigger.channels.includes('WhatsApp')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" disabled={!workflow.trigger.channels.includes('Email')}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sms" className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="sms-from">From (Phone Number)</Label>
              <Input 
                id="sms-from" 
                placeholder="+15551234567" 
                value={senderSMS}
                onChange={(e) => setSenderSMS(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Format: +[country code][number], e.g., +15551234567
              </p>
            </div>
            
            <div className="grid w-full gap-2">
              <Label htmlFor="sms-message">Message Text</Label>
              <div className="relative">
                <Input 
                  id="sms-message" 
                  placeholder="Type your message here" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <p className="text-xs text-gray-500">
                Include the trigger keyword "{workflow.trigger.keyword}" to activate the workflow
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="whatsapp" className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="whatsapp-from">From (Phone Number)</Label>
              <Input 
                id="whatsapp-from" 
                placeholder="+15551234567" 
                value={senderWhatsApp}
                onChange={(e) => setSenderWhatsApp(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Format: +[country code][number], e.g., +15551234567
              </p>
            </div>
            
            <div className="grid w-full gap-2">
              <Label htmlFor="whatsapp-message">Message Text</Label>
              <div className="relative">
                <Input 
                  id="whatsapp-message" 
                  placeholder="Type your message here" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <p className="text-xs text-gray-500">
                Include the trigger keyword "{workflow.trigger.keyword}" to activate the workflow
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="email-from">From Email</Label>
              <Input 
                id="email-from" 
                placeholder="user@example.com" 
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
            
            <div className="grid w-full gap-2">
              <Label htmlFor="email-subject">Subject</Label>
              <div className="relative">
                <Input 
                  id="email-subject" 
                  placeholder="Email subject" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <p className="text-xs text-gray-500">
                Include the trigger keyword "{workflow.trigger.keyword}" in the subject to activate the workflow
              </p>
            </div>
            
            <div className="grid w-full gap-2">
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea 
                id="email-body" 
                placeholder="Email content" 
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {testResult && (
          <Alert className={`mt-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <AlertCircle className={`h-4 w-4 ${testResult.success ? 'text-green-500' : 'text-red-500'}`} />
            <AlertTitle className={testResult.success ? 'text-green-700' : 'text-red-700'}>
              {testResult.success ? 'Test Successful' : 'Test Failed'}
            </AlertTitle>
            <AlertDescription className={testResult.success ? 'text-green-600' : 'text-red-600'}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          This simulates an inbound message from a customer
        </p>
        <Button 
          onClick={handleSimulate} 
          disabled={isLoading}
        >
          {isLoading ? "Simulating..." : "Simulate Message"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookSimulator;
