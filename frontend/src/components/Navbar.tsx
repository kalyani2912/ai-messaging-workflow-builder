import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { getCurrentUser, signOut } from "../utils/userStore";


const Navbar = () => {
  const user = getCurrentUser()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl text-brand-primary">
            AI Workflow Builder
          </Link>
          {user ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
               Home
              </Link>
              <Link to="/workflows" className="text-gray-600 hover:text-gray-900">
                My Workflows
              </Link>
              <Link to="/create-workflow" className="text-gray-600 hover:text-gray-900">
                Create Workflow
             </Link>
            </nav>
          </>
          ):(<div></div>)}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline-block">
                Hello, {user.name || user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Try it Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar;





/*

<div className="flex items-center space-x-4">
        {user
          ? <>
            <span>Hello, {user.name || user.email}</span>
            <button onClick={handleSignOut} className="text-red-500">Sign Out</button>
          </>
          : <>
            <Link to="signin" className="mr-4">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </>}
      </div>
    </nav>






*/


/*
const Navbar = () => {
  const navigate = useNavigate();
  //const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-xl text-brand-primary">
            AI Workflow Builder
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            {authenticated && (
              <Link to="/workflows" className="text-gray-600 hover:text-gray-900">
                My Workflows
              </Link>
            )}
            <Link to="/create-workflow" className="text-gray-600 hover:text-gray-900">
              Create Workflow
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {authenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline-block">
                Hello, {currentUser?.name || currentUser?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Try it Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
*/