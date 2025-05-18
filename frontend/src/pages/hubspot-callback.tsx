import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, connectHubSpot } from "../utils/userStore";

const HubSpotCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      navigate("/");
      return;
    }

    const clientId = "YOUR_HUBSPOT_CLIENT_ID";
    const clientSecret = "YOUR_HUBSPOT_CLIENT_SECRET";
    const redirectUri = "http://localhost:3000/hubspot-callback";

    fetch("https://api.hubapi.com/oauth/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      }).toString()
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          //connectHubSpot(data.access_token, data.refresh_token, data.expires_in);
        }
        navigate("/");
      })
      .catch(error => {
        console.error("HubSpot auth error:", error);
        navigate("/");
      });
  }, [navigate]);

  return <p>Connecting your HubSpot account...</p>;
};

export default HubSpotCallback;
