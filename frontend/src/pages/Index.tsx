
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import KeyFeatures from "../components/home/KeyFeatures";
import ExampleCarousel from "../components/home/ExampleCarousel";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { isAuthenticated, getCurrentUser } from "../utils/userStore";

function LogHubSpotContacts() {
  useEffect(() => {
    async function fetchAndLog() {
      try {
        const res = await fetch('/api/hubspot/contacts');
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log('📇 HubSpot contacts:', data.results.slice(0, 5));
      } catch (err) {
        console.error('❌ Failed to fetch HubSpot contacts:', err);
      }
    }
    fetchAndLog();
  }, []);

  return null; // this component renders nothing visible
}


const Index = () => {
  const navigate = useNavigate();

  const [crmStatus, setCrmStatus] = useState<{
  tested: boolean;
  success: boolean;
  message: string;
  }>({ tested: false, success: false, message: "" });


  return (
    <Layout>
        <div className="container mx-auto mt-2">
          <Alert className="mb-1">
            <AlertTitle>Enhance your workflows with HubSpot CRM</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex gap-2">
              {/* — Static HubSpot Connected Banner — */}
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                <p className="font-medium">✅ HubSpot CRM connected</p>
              </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

      <HeroSection />
      <HowItWorks />
      <KeyFeatures />
      <ExampleCarousel />
      {/* —— new: fetch & log first 5 contacts —— */}
        {/* On load, this will call our proxy: GET /api/hubspot/contacts and dump the results into the console.*/}
        <LogHubSpotContacts />
    </Layout>
  );

};

export default Index;
