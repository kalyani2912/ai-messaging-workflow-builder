
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPwd  from './pages/ForgotPassword';
import ResetPwd   from './pages/ResetPassword';
import { getCurrentUser, fetchMe } from "./utils/userStore";


// ProtectedRoute
const ProtectedRoute = ({ children }) => {
   if (!getCurrentUser()) {
     // relative redirect under basename
     return <Navigate to="signin" replace />;
   }
   return <>{children}</>;
 }; 

const queryClient = new QueryClient();

export default function App() {
  const basename = import.meta.env.BASE_URL || '/'
  console.log(basename);
  useEffect(() => {
    fetchMe().catch(err => console.warn("fetchMe failed:",err));
  }, []) 

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          /* index route */
          <Route index element={<Index />} />
          
          /* auth */    
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPwd />} />
          <Route path="reset-password" element={<ResetPwd />} />
          
          /* catch-all */
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
   )
 }         
