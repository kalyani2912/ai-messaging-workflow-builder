
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import Layout from "../components/Layout";
import { signUp } from "../utils/userStore";
import {
  initializeGoogleIdentity,
  renderGoogleButton,
} from '../utils/googleGIS';

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const ok = await signUp(email, password, name)
    setIsLoading(false)
    if (ok) navigate('/workflows')
  }

  const handleCredentialResponse = async (response: { credential: string }) => {
      const idToken = response.credential;
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      window.location.href = '/workflows';
    };
  
    useEffect(() => {
      initializeGoogleIdentity(
        import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        handleCredentialResponse
      );
      renderGoogleButton('google-signin-button');
      // Optional: auto-prompt one-tap
      // @ts-expect-error: expect error
      google.accounts.id.prompt();
    }, []);


  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create an account using Email or Sign Up with Google
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
          <div className="w-full flex justify-center mt-4 mb-4">
           <div id="google-signin-button"></div>
          </div>
          <div className="px-8 pb-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => navigate("/signin")}>
                Sign in
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

