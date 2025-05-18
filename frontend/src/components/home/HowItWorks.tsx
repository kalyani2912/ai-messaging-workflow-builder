
import { ArrowRight, MessageSquare, Upload, Send } from "lucide-react";

const steps = [
  {
    icon: <MessageSquare className="h-12 w-12 text-brand-blue" />,
    title: "Chat with the AI assistant",
    description: "Describe your campaign goals, target audience, and messaging needs in plain conversation."
  },
  {
    icon: <Upload className="h-12 w-12 text-brand-blue" />,
    title: "Upload your contact list",
    description: "Import contacts via CSV with consent validation to ensure compliance with messaging regulations."
  },
  {
    icon: <Send className="h-12 w-12 text-brand-blue" />,
    title: "Launch your Messaging Workflow",
    description: "Publish your campaign and let AI handle the timing, personalization, and follow-ups automatically."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building automated messaging campaigns has never been easier. Just follow these three simple steps:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="feature-card h-full flex flex-col items-center text-center">
                <div className="mb-6 p-3 bg-brand-lightGray rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center md:hidden my-6">
                  <ArrowRight className="h-8 w-8 text-gray-300 transform rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
