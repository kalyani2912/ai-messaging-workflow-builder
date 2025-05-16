
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-brand-primary">AI-Powered</span> Messaging Workflows
            <span className="text-brand-primary">.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700">
            Create messaging workflows without writing a single rule.
            Just describe what you want, and AI builds it for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link to="/signup">Try it Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/create-workflow">Create a Workflow</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
