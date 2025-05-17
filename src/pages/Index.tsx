
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

const Index = () => {
  const [showHubspotAlert, setShowHubspotAlert] = useState(false);
  const navigate = useNavigate();

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

  const handleConnectHubspot = () => {
    // In a real app, this would redirect to HubSpot OAuth flow
    // For this demo, we'll just simulate with a console log
    console.log("Connecting to HubSpot...");
    
    // Simulate OAuth redirect and return
    setTimeout(() => {
      alert("HubSpot connected successfully! (Simulated)");
      setShowHubspotAlert(false);
    }, 1000);
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
      <HeroSection />
      <HowItWorks />
      <KeyFeatures />
      <ExampleCarousel />
    </Layout>
  );
};

export default Index;
