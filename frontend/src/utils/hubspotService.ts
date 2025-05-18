
import { toast } from "../hooks/use-toast";
import { getCurrentUser } from "./userStore";
import { HubSpotContact, HubSpotMeeting, ContactData } from "./types/workflow";

const HUBSPOT_API = "https://api.hubapi.com";
const USE_HUBSPOT_LIVE = true; // Toggle this to false for mock data

const getMockContacts = (): HubSpotContact[] => [
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

const getMockMeetings = (contactId: string): HubSpotMeeting[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  return [
    {
      id: `meeting_${contactId}_1`,
      properties: {
        hs_meeting_title: "Appointment 1",
        hs_meeting_body: "Initial meeting",
        hs_meeting_start_time: tomorrow.toISOString(),
        hs_meeting_end_time: new Date(tomorrow.getTime() + 30 * 60000).toISOString()
      }
    },
    {
      id: `meeting_${contactId}_2`,
      properties: {
        hs_meeting_title: "Follow-up",
        hs_meeting_body: "Follow-up consultation",
        hs_meeting_start_time: nextWeek.toISOString(),
        hs_meeting_end_time: new Date(nextWeek.getTime() + 60 * 60000).toISOString()
      }
    }
  ];
};

const makeHubSpotRequest = async (endpoint: string, accessToken: string): Promise<any> => {
  try {
    const response = await fetch(`${HUBSPOT_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!response.ok) throw new Error("Failed API call");
    return await response.json();
  } catch (error) {
    console.error("HubSpot API error:", error);
    toast({
      title: "HubSpot API Error",
      description: "Could not fetch data from HubSpot. Using mock data instead.",
      variant: "destructive"
    });
    return null;
  }
};

export const getHubSpotContacts = async (query = ""): Promise<HubSpotContact[]> => {
  const user = getCurrentUser();
  if (!user?.hubspot_connected || !user.hubspot_token) {
    toast({ title: "HubSpot not connected", description: "Please connect your HubSpot account.", variant: "destructive" });
    return [];
  }

  if (!USE_HUBSPOT_LIVE) {
    return getMockContacts();
  }

  const data = await makeHubSpotRequest("/crm/v3/objects/contacts?properties=firstname,lastname,email,phone,opt_in", user.hubspot_token);
  const contacts = data?.results || [];
  return query ? contacts.filter(contact =>
    `${contact.properties.firstname} ${contact.properties.lastname}`.toLowerCase().includes(query.toLowerCase()) ||
    contact.properties.email?.toLowerCase().includes(query.toLowerCase()) ||
    contact.properties.phone?.includes(query)
  ) : contacts;
};

export const getContactMeetings = async (contactId: string): Promise<HubSpotMeeting[]> => {
  const user = getCurrentUser();
  if (!user?.hubspot_connected || !user.hubspot_token) return [];

  if (!USE_HUBSPOT_LIVE) {
    const contact = await getHubSpotContact(contactId);
    return contact?.properties.opt_in ? getMockMeetings(contactId) : [];
  }

  const associations = await makeHubSpotRequest(`/crm/v3/objects/contacts/${contactId}/associations/meetings`, user.hubspot_token);
  const meetingIds = associations?.results?.map((assoc: any) => assoc.id) || [];
  const meetings: HubSpotMeeting[] = [];

  for (const id of meetingIds) {
    const meeting = await makeHubSpotRequest(`/crm/v3/objects/meetings/${id}?properties=hs_meeting_title,hs_meeting_body,hs_meeting_start_time,hs_meeting_end_time`, user.hubspot_token);
    if (meeting?.properties) {
      meetings.push(meeting);
    }
  }

  const contact = await getHubSpotContact(contactId);
  return contact?.properties.opt_in ? meetings : [];
};

export const getHubSpotContact = async (contactId: string): Promise<HubSpotContact | null> => {
  const contacts = await getHubSpotContacts();
  return contacts.find(contact => contact.id === contactId) || null;
};

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
        appointment_type: nextMeeting?.properties.hs_meeting_title,
        appointment_time: nextMeeting?.properties.hs_meeting_start_time,
        appointment_notes: nextMeeting?.properties.hs_meeting_body,
        crm_id: contactId
      });
    }
  }
  return contactData;
};
