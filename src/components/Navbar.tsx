
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-brand-blue to-brand-teal"></div>
            <span className="font-heading font-bold text-xl hidden sm:block">AI Workflow Builder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-brand-blue transition-colors">
              Home
            </Link>
            <Link to="/workflows" className="text-gray-700 hover:text-brand-blue transition-colors">
              Workflows
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-brand-blue transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-brand-blue transition-colors">
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button asChild>
              <Link to="/create-workflow">Try it Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/workflows"
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={toggleMenu}
              >
                Workflows
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={toggleMenu}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <Button asChild className="w-full">
                <Link to="/create-workflow" onClick={toggleMenu}>
                  Try it Free
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
