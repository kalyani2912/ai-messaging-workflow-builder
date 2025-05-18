// src/utils/hubspotAuth.ts

const CLIENT_ID = "<your_hubspot_client_id>";
const CLIENT_SECRET = "<your_hubspot_client_secret>";
const REDIRECT_URI = "http://localhost:3000/api/hubspot/callback"; // adjust as needed
const TOKEN_URL = "https://api.hubapi.com/oauth/v1/token";

// Step 1: Exchange code for access token
export const exchangeCodeForToken = async (code: string) => {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code
    }).toString()
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  return await response.json(); // includes access_token, refresh_token
};
