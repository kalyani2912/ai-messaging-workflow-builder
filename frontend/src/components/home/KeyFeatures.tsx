
import { MessageSquare, Users, Calendar, FileText } from "lucide-react";

const features = [
  {
    icon: <MessageSquare className="h-8 w-8 text-brand-blue" />,
    title: "Intelligent Message Campaigns",
    description: "Create drip campaigns, appointment reminders, promotions, and auto-replies without coding or complex rule-building."
  },
  {
    icon: <Users className="h-8 w-8 text-brand-blue" />,
    title: "Contact Management",
    description: "Upload CSV contact lists with automated consent validation to ensure messaging compliance and deliverability."
  },
  {
    icon: <Calendar className="h-8 w-8 text-brand-blue" />,
    title: "Real-time Workflow Visualization",
    description: "See your messaging workflow built in real-time as you chat with our AI assistant. Edit, modify, and perfect as you go."
  },
  {
    icon: <FileText className="h-8 w-8 text-brand-blue" />,
    title: "Performance Tracking",
    description: "Monitor delivery rates, opens, clicks, and responses with built-in dashboards. Export reports with one click."
  }
];

const KeyFeatures = () => {
  return (
    <section className="py-20 bg-brand-lightGray">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Key Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, manage, and optimize your messaging workflows without technical expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card flex">
              <div className="mr-6 p-2 bg-brand-blue bg-opacity-10 rounded-lg self-start">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
