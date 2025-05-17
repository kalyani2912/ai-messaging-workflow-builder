
// Simple user store for authentication (in a real app, this would use proper backend auth)
import { toast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  createdAt: string;
  hubspot_connected?: boolean;
  hubspot_token?: string;
}

const users: User[] = [];
let currentUser: User | null = null;
const HUBSPOT_FIXED_TOKEN = "pat-na2-d864e111-79f7-4bf4-a088-1e98cd639f08";

const initializeSession = () => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
  }
};

initializeSession();

export const signUp = (email: string, password: string, name?: string): boolean => {
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    toast({ title: "Registration failed", description: "This email is already registered.", variant: "destructive" });
    return false;
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
    hubspot_connected: true,
    hubspot_token: HUBSPOT_FIXED_TOKEN
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));

  toast({ title: "Registration successful", description: "Your account has been created." });
  return true;
};

export const signIn = (email: string, password: string): boolean => {
  const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const user = storedUsers.find((u: User) => u.email === email && u.password === password);

  if (!user) {
    toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    return false;
  }

  user.hubspot_connected = true;
  user.hubspot_token = HUBSPOT_FIXED_TOKEN;
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));

  toast({ title: "Login successful", description: "Welcome back!" });
  return true;
};

export const signOut = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  toast({ title: "Logged out", description: "You have been logged out." });
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};
