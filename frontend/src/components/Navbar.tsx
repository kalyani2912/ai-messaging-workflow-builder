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
          {user ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
               Home
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
              <Link to="/signin">
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
