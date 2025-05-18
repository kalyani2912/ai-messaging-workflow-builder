
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 py-12 mt-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-brand-blue to-brand-teal"></div>
              <span className="font-heading font-bold text-xl">AI Workflow Builder</span>
            </div>
            <p className="text-gray-600 mb-4">
              Create messaging workflows without writing a single rule. Just describe what you want, and AI builds it for you.
            </p>
            <p className="text-gray-800 font-medium">Messaging made human.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-brand-blue transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-gray-600 hover:text-brand-blue transition-colors">
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {currentYear} AI Messaging Workflow Builder. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
