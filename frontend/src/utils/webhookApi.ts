
import { simulateInboundSMS, simulateInboundWhatsApp, simulateInboundEmail } from "./webhookService";
import { toast } from "../hooks/use-toast";

// In a real application, these would be actual API endpoints.
// For this demo, we'll create functions that can be called from UI components.

// Process inbound SMS webhook
export async function handleInboundSmsWebhook(payload: { from: string; text: string }): Promise<Response> {
  try {
    // Validate phone number
    if (!payload.from.match(/^\+\d{10,15}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be in format +15551234567",
        variant: "destructive"
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid phone number format" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await simulateInboundSMS(payload.from, payload.text);
    
    if (result) {
      toast({
        title: "SMS Processed",
        description: `Inbound message from ${payload.from} processed successfully`
      });
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      toast({
        title: "No Matching Workflows",
        description: `No active workflows matched the inbound SMS`,
        variant: "destructive"
      });
      
      return new Response(JSON.stringify({ success: false, reason: "No matching workflows" }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    
    toast({
      title: "Error",
      description: `Failed to process inbound SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Process inbound WhatsApp webhook
export async function handleInboundWhatsAppWebhook(payload: { from: string; text: string }): Promise<Response> {
  try {
    // Validate phone number
    if (!payload.from.match(/^\+\d{10,15}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be in format +15551234567",
        variant: "destructive"
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid phone number format" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await simulateInboundWhatsApp(payload.from, payload.text);
    
    if (result) {
      toast({
        title: "WhatsApp Processed",
        description: `Inbound message from ${payload.from} processed successfully`
      });
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      toast({
        title: "No Matching Workflows",
        description: `No active workflows matched the inbound WhatsApp message`,
        variant: "destructive"
      });
      
      return new Response(JSON.stringify({ success: false, reason: "No matching workflows" }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    
    toast({
      title: "Error",
      description: `Failed to process inbound WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Process inbound Email webhook
export async function handleInboundEmailWebhook(payload: { from: string; subject: string; body?: string }): Promise<Response> {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.from)) {
      toast({
        title: "Invalid Email Address",
        description: "Please provide a valid email address",
        variant: "destructive"
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid email address" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await simulateInboundEmail(payload.from, payload.subject, payload.body);
    
    if (result) {
      toast({
        title: "Email Processed",
        description: `Inbound email from ${payload.from} processed successfully`
      });
      
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      toast({
        title: "No Matching Workflows",
        description: `No active workflows matched the inbound email`,
        variant: "destructive"
      });
      
      return new Response(JSON.stringify({ success: false, reason: "No matching workflows" }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error processing Email webhook:', error);
    
    toast({
      title: "Error",
      description: `Failed to process inbound email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// For the frontend, we'll create a simplified version that can be called directly
export async function simulateInboundMessage(
  channel: 'sms' | 'whatsapp' | 'email',
  from: string,
  content: string,
  subject?: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (channel === 'sms' || channel === 'whatsapp') {
      if (!from.match(/^\+\d{10,15}$/)) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be in format +15551234567",
          variant: "destructive"
        });
        throw new Error("Invalid phone number format");
      }
    } else if (channel === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(from)) {
        toast({
          title: "Invalid Email Address",
          description: "Please provide a valid email address",
          variant: "destructive"
        });
        throw new Error("Invalid email address");
      }
    }
    
    let result: boolean;
    
    switch (channel) {
      case 'sms':
        result = await simulateInboundSMS(from, content);
        break;
      case 'whatsapp':
        result = await simulateInboundWhatsApp(from, content);
        break;
      case 'email':
        result = await simulateInboundEmail(from, subject || content, content);
        break;
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
    
    if (result) {
      toast({
        title: `${channel.toUpperCase()} Processed`,
        description: `Message processed successfully. Check execution logs below.`
      });
    } else {
      toast({
        title: "No Matching Workflows",
        description: `No active workflows matched the message`,
        variant: "destructive"
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Error simulating inbound ${channel}:`, error);
    
    toast({
      title: "Error",
      description: `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    
    throw error;
  }
}
