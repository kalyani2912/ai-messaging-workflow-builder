
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import Layout from "../components/Layout";
import { signUp } from "../utils/userStore";

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

  const handleGoogle = (googleUser) => {
    const profile = googleUser.getBasicProfile();
    console.log('Google ID:', profile.getId());
    console.log('Name:', profile.getName());
    console.log('Email:', profile.getEmail());
    // 4b. Send the ID token to your backend to create / verify session:
    const id_token = googleUser.getAuthResponse().id_token;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
    }).then(() => window.location.reload());
  }

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
          <div className="my-4 text-center">
              <div id="google-signin-button" className="my-4 text-center"></div>
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

