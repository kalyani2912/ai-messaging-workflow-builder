
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { simulateInboundMessage } from "@/utils/webhookApi";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mail } from "lucide-react";
import { StoredWorkflow } from "@/utils/workflowStore";

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

  // Only show for active workflows
  if (workflow.status !== 'active') {
    return null;
  }

  const handleSimulate = async () => {
    setIsLoading(true);
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
    } catch (error) {
      console.error('Simulation error:', error);
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
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
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
                Include the trigger keyword "{workflow.keyword}" to activate the workflow
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
                Include the trigger keyword "{workflow.keyword}" to activate the workflow
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
                Include the trigger keyword "{workflow.keyword}" in the subject to activate the workflow
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
