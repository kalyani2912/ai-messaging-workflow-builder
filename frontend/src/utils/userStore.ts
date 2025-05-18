import { apiClient } from './apiClient'

export interface User { id:string; name:string; email:string }
let currentUser: User|null = null

// — Sign Up
export async function signUp(email: string, password: string, name?: string) {
  const res = await apiClient('/auth/signup', {
    method:'POST', body: JSON.stringify({ email, password, name })
  })
  if (!res.ok) return false
  const { user } = await res.json()
  currentUser = user; return true
}

// — Sign In
export async function signIn(email:string, password:string) {
  const res = await apiClient('/auth/signin',{
    method:'POST', body: JSON.stringify({ email, password })
  })
  if (!res.ok) return false
  const { user } = await res.json()
  currentUser = user; return true
}

// — Fetch current user
export async function fetchMe() {
  const res = await apiClient('/auth/me')
  if (res.ok) {
    const { user } = await res.json()
    currentUser = user
  }
}

// — Sign Out
export async function signOut() {
  await apiClient('/auth/signout',{ method:'POST' })
  currentUser = null
}

// — Forgot Password
export async function forgotPassword(email:string) {
  const res = await apiClient('/auth/forgot-password',{
    method:'POST', body: JSON.stringify({ email })
  })
  return res.ok
}

// — Reset Password
export async function resetPassword(token:string, password:string) {
  const res = await apiClient('/auth/reset-password',{
    method:'POST', body: JSON.stringify({ token, password })
  })
  return res.ok
}

// — Getter
export function getCurrentUser() { return currentUser }
export function isAuthenticated() { return currentUser !== null }
