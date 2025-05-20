import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Label } from '../components/ui/label'
import Layout from '../components/Layout'
import { signIn } from '../utils/userStore'
import {
  initializeGoogleIdentity,
  renderGoogleButton,
} from '../utils/googleGIS';


export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const ok = await signIn(email, password)
    setIsLoading(false)
    if (ok) navigate('/home')
  }

  const handleCredentialResponse = async (response: { credential: string }) => {
    const idToken = response.credential;
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    });
    window.location.href = '/home';
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
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>Enter your credentials or use Google SSO</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
          <div className="w-full flex justify-center mt-4 mb-4">
           <div id="google-signin-button"></div>
          </div>
          <div className="px-8 pb-6 text-center">
            <p className="text-sm text-gray-500">
              Don’t have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
