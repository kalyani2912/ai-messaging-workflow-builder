
// Validate and normalize user input for workflow type selection
export const validateWorkflowTypeInput = (input: string): string | null => {
  const normalized = input.trim().toLowerCase();
  
  if (['1', 'keyword', 'trigger'].includes(normalized)) {
    return 'keyword_trigger';
  }
  
  if (['2', 'appointment', 'reminder'].includes(normalized)) {
    return 'appointment_reminder';
  }
  
  return null;
};

// Validate channel input with normalization
export const validateChannelInput = (input: string): string[] => {
  const normalizedInput = input.trim().toLowerCase();
  const channels = normalizedInput.split(/[,;]/);
  const allowedChannels = ["sms", "whatsapp", "email", "messenger"];
  
  return channels
    .map(channel => channel.trim())
    .filter(channel => allowedChannels.includes(channel))
    .map(channel => normalizeChannelInput(channel));
};

export const normalizeChannelInput = (input: string): string => {
  const normalizedInput = input.trim().toLowerCase();
  const map: Record<string, string> = {
    "sms": "SMS",
    "whatsapp": "WhatsApp",
    "email": "Email",
    "messenger": "Messenger"
  };
  
  return map[normalizedInput] || input;
};

// Handle malformed or blank responses
export const handleResponseError = (response: string | null): string => {
  if (!response || response.trim().length === 0) {
    return "Sorry, something went wrong. Please try again.";
  }
  
  return response;
};
