
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-brand-lightGray to-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Talk to AI. Launch Campaigns.
              <span className="block text-brand-blue">It's That Simple.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Create messaging workflows without writing a single rule. Just describe what you want, and AI builds it for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 py-6 text-lg">
                <Link to="/create-workflow">Try it Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link to="/workflows">See Examples</Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-brand-lightGray p-3 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-brand-blue to-brand-teal"></div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg flex-1">
                  <p className="text-gray-800">I need to send appointment reminders 24 hours before, and follow up with feedback requests after the appointment.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="bg-brand-blue bg-opacity-10 p-4 rounded-lg">
                    <p className="text-gray-800">Great! I'll create an appointment reminder workflow for you. It will:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      <li>Send SMS reminder 24hrs before appointment</li>
                      <li>Check for cancellations or reschedules</li>
                      <li>Send thank you email with feedback form 2hrs after appointment</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-brand-lightGray p-3 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900"></div>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                <p className="text-gray-700">That's perfect! Let me add my contacts...</p>
                <Button size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
