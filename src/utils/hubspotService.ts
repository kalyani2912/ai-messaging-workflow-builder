
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "./userStore";
import { HubSpotContact, HubSpotMeeting, ContactData } from "./types/workflow";

// Mock HubSpot API for demo purposes
// In a real implementation, this would call actual HubSpot API endpoints

// Get HubSpot contacts
export const getHubSpotContacts = async (query = ""): Promise<HubSpotContact[]> => {
  const user = getCurrentUser();
  
  if (!user?.hubspot_connected) {
    toast({
      title: "HubSpot not connected",
      description: "Please connect your HubSpot account first.",
      variant: "destructive"
    });
    return [];
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock contacts
  const mockContacts: HubSpotContact[] = [
    {
      id: "contact1",
      properties: {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "+15551234567",
        opt_in: true
      }
    },
    {
      id: "contact2",
      properties: {
        firstname: "Jane",
        lastname: "Smith",
        email: "jane.smith@example.com",
        phone: "+15557654321",
        opt_in: true
      }
    },
    {
      id: "contact3",
      properties: {
        firstname: "Robert",
        lastname: "Johnson",
        email: "robert@example.com",
        phone: "+15559876543",
        opt_in: false
      }
    },
    {
      id: "contact4",
      properties: {
        firstname: "Emily",
        lastname: "Williams",
        email: "emily@example.com",
        phone: "+15551112222",
        opt_in: true
      }
    }
  ];
  
  // Filter by query if provided
  const filtered = query 
    ? mockContacts.filter(contact => 
        `${contact.properties.firstname} ${contact.properties.lastname}`.toLowerCase().includes(query.toLowerCase()) ||
        contact.properties.email?.toLowerCase().includes(query.toLowerCase()) ||
        contact.properties.phone?.includes(query)
      )
    : mockContacts;
  
  return filtered;
};

// Get meetings for a contact
export const getContactMeetings = async (contactId: string): Promise<HubSpotMeeting[]> => {
  const user = getCurrentUser();
  
  if (!user?.hubspot_connected) {
    toast({
      title: "HubSpot not connected",
      description: "Please connect your HubSpot account first.",
      variant: "destructive"
    });
    return [];
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock meetings based on contact ID to ensure consistent results
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const mockMeetings: HubSpotMeeting[] = [
    {
      id: `meeting_${contactId}_1`,
      properties: {
        hs_meeting_title: contactId === "contact1" ? "Dental Checkup" : 
                        contactId === "contact2" ? "Haircut Appointment" :
                        contactId === "contact3" ? "Medical Consultation" : "Car Service",
        hs_meeting_body: "Regular appointment",
        hs_meeting_start_time: tomorrow.toISOString(),
        hs_meeting_end_time: new Date(tomorrow.getTime() + 30 * 60000).toISOString()
      }
    },
    {
      id: `meeting_${contactId}_2`,
      properties: {
        hs_meeting_title: contactId === "contact1" ? "Follow-up Consultation" : 
                        contactId === "contact2" ? "Style Consultation" :
                        contactId === "contact3" ? "Annual Checkup" : "Tire Replacement",
        hs_meeting_body: "Second appointment",
        hs_meeting_start_time: nextWeek.toISOString(),
        hs_meeting_end_time: new Date(nextWeek.getTime() + 60 * 60000).toISOString()
      }
    }
  ];
  
  // Only return meetings for contacts with opt-in
  const contact = await getHubSpotContact(contactId);
  if (!contact || !contact.properties.opt_in) {
    return [];
  }
  
  return mockMeetings;
};

// Get a single contact
export const getHubSpotContact = async (contactId: string): Promise<HubSpotContact | null> => {
  const contacts = await getHubSpotContacts();
  return contacts.find(contact => contact.id === contactId) || null;
};

// Transform HubSpot contacts and meetings to ContactData
export const transformHubspotToContactData = async (contactIds: string[]): Promise<ContactData[]> => {
  const contactData: ContactData[] = [];
  
  for (const contactId of contactIds) {
    const contact = await getHubSpotContact(contactId);
    if (!contact) continue;
    
    const meetings = await getContactMeetings(contactId);
    const nextMeeting = meetings.length > 0 ? meetings[0] : null;
    
    if (contact.properties.opt_in) {
      contactData.push({
        id: `crm_contact_${contactId}`,
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        email: contact.properties.email,
        phone: contact.properties.phone,
        preferred_channel: "SMS",
        opt_in: true,
        appointment_type: nextMeeting?.properties.hs_meeting_title || undefined,
        appointment_time: nextMeeting?.properties.hs_meeting_start_time || undefined,
        appointment_notes: nextMeeting?.properties.hs_meeting_body || undefined,
        crm_id: contactId
      });
    }
  }
  
  return contactData;
};
