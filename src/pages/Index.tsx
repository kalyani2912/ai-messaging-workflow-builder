
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import KeyFeatures from "../components/home/KeyFeatures";
import ExampleCarousel from "../components/home/ExampleCarousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/utils/userStore";
import { getHubSpotContacts } from "@/utils/hubspotService";


const Index = () => {
  const [showHubspotAlert, setShowHubspotAlert] = useState(false);
  const navigate = useNavigate();

  const [crmStatus, setCrmStatus] = useState<{
  tested: boolean;
  success: boolean;
  message: string;
  }>({ tested: false, success: false, message: "" });



  useEffect(() => {
    // Check if user is logged in but hasn't connected HubSpot
    const checkHubspotStatus = () => {
      const user = getCurrentUser();
      if (isAuthenticated() && user && !user.hubspot_connected) {
        setShowHubspotAlert(true);
      }
    };
    
    checkHubspotStatus();
  }, []);

  /* const handleConnectHubspot = () => {
    // In a real app, this would redirect to HubSpot OAuth flow
    // For this demo, we'll just simulate with a console log
    console.log("Connecting to HubSpot...");
    
    // Simulate OAuth redirect and return
    setTimeout(() => {
      alert("HubSpot connected successfully! (Simulated)");
      setShowHubspotAlert(false);
    }, 1000);
  }; */

  const handleConnectHubspot = () => {
   /* const clientId = "YOUR_HUBSPOT_CLIENT_ID";
    const redirectUri = "http://localhost:3000/hubspot-callback"; // or your deployed URL
    const scopes = [
     "crm.objects.contacts.read",
     "crm.objects.contacts.associations.read",
     "crm.objects.engagements.read"
    ].join("%20");

    window.location.href = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`; */
    alert("HubSpot CRM is already connected using a fixed token.");
  };

  const handleTestCRMConnection = async () => {
    try {
     const contacts = await getHubSpotContacts();
      if (contacts && contacts.length > 0) {
        setCrmStatus({
          tested: true,
          success: true,
         message: `✅ CRM Connected — Found ${contacts.length} contact(s)`
       });
     } else {
       setCrmStatus({
         tested: true,
         success: false,
         message: "❌ CRM connection seems valid but no contacts found."
       });
     }
    } 
    catch (error) {
      setCrmStatus({
      tested: true,
      success: false,
      message: "❌ Failed to connect to HubSpot CRM."
     });
    }
  };



  return (
    <Layout>
      {showHubspotAlert && (
        <div className="container mx-auto mt-6">
          <Alert className="mb-4">
            <AlertTitle>Enhance your workflows with HubSpot CRM</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span>Connect your HubSpot account to use your contacts and meetings in automated workflows.</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowHubspotAlert(false)}>
                  Not Now
                </Button>
                <Button size="sm" onClick={handleConnectHubspot}>
                  Connect HubSpot
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {isAuthenticated() && getCurrentUser()?.hubspot_connected && (
        <div className="container mx-auto mt-4">
          <Alert className="mb-4" variant={crmStatus.success ? "default" : "destructive"}>
            <AlertTitle>Test HubSpot CRM Connection</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span>{crmStatus.tested ? crmStatus.message : "Click below to verify your CRM is connected properly."}</span>
              <Button size="sm" onClick={handleTestCRMConnection}>
                Test Connection
              </Button>
            </AlertDescription>
          </Alert>
       </div>
      )}

      <HeroSection />
      <HowItWorks />
      <KeyFeatures />
      <ExampleCarousel />
    </Layout>
  );

};

export default Index;
