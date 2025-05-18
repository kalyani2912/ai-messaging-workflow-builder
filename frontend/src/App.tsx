
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Workflows from "./pages/Workflows";
import WorkflowDetail from "./pages/WorkflowDetail";
import CreateWorkflow from "./pages/CreateWorkflow";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPwd  from './pages/ForgotPassword';
import ResetPwd   from './pages/ResetPassword';
import { fetchMe, isAuthenticated } from "./utils/userStore";

// ProtectedRoute
const ProtectedRoute = ({ children }: { children:any }) =>
  isAuthenticated() ? children : <Navigate to="/signin" replace />

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => { fetchMe() }, [])
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPwd />} />
          <Route path="/reset-password" element={<ResetPwd />} />
          <Route path="/workflows" element={<ProtectedRoute><Workflows/></ProtectedRoute>} />
          <Route path="/workflow/:id" element={<ProtectedRoute><WorkflowDetail/></ProtectedRoute>} />
          <Route path="/create-workflow" element={<ProtectedRoute><CreateWorkflow/></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
