
import { toast } from "../hooks/use-toast";

const HUBSPOT_API = ""; // leave blank so fetches go to the same origin

export const getHubSpotContacts = async (query = "") => {
  const resp = await fetch(`/api/hubspot/contacts`);
  if (!resp.ok) {
    toast({ title: 'Failed to fetch contacts', variant: 'destructive' });
    return [];
  }
  const data = await resp.json();
  return data.results || [];
};
