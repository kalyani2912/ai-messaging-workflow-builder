// import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../utils/userStore'

/*interface LayoutProps {
  children: ReactNode;
}*/

export default function Layout({ children }: any) {
  const user = getCurrentUser()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()            // clear server cookie + client state
    navigate('/signin')        // redirect immediately
  }
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}