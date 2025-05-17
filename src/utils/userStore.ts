
// Simple user store for authentication (in a real app, this would use proper backend auth)
import { toast } from "@/hooks/use-toast";
import { HubSpotCredentials } from "./types/workflow";

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  createdAt: string;
  hubspot_connected?: boolean;
  hubspot_credentials?: HubSpotCredentials;
  hubspot_token?: string;
  hubspot_refresh_token?: string;
  hubspot_token_expires_at?: number;
}

const users: User[] = [];
let currentUser: User | null = null;

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

// Add HubSpot connection methods
export const connectHubSpot = (accessToken: string, refreshToken: string, expiresIn: number): boolean => {
  if (!currentUser) {
    toast({ title: "Authentication required", description: "Please sign in to connect HubSpot.", variant: "destructive" });
    return false;
  }

  currentUser.hubspot_connected = true;
  currentUser.hubspot_token = accessToken;
  currentUser.hubspot_refresh_token = refreshToken;
  currentUser.hubspot_token_expires_at = Date.now() + expiresIn * 1000;

  const userIndex = users.findIndex(u => u.id === currentUser?.id);
  if (userIndex >= 0) {
    users[userIndex] = { ...currentUser };
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('users', JSON.stringify(users));

  toast({ title: "HubSpot Connected", description: "Your HubSpot CRM account has been connected successfully." });
  return true;
};

export const disconnectHubSpot = (): boolean => {
  if (!currentUser) return false;

  currentUser.hubspot_connected = false;
  delete currentUser.hubspot_token;
  delete currentUser.hubspot_refresh_token;
  delete currentUser.hubspot_token_expires_at;

  const userIndex = users.findIndex(u => u.id === currentUser?.id);
  if (userIndex >= 0) {
    users[userIndex] = { ...currentUser };
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('users', JSON.stringify(users));

  toast({ title: "HubSpot Disconnected", description: "Your HubSpot CRM account has been disconnected." });
  return true;
};

try {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    const parsedUsers = JSON.parse(storedUsers);
    if (Array.isArray(parsedUsers)) {
      users.push(...parsedUsers);
    }
  }
} catch (error) {
  console.error('Failed to load users from localStorage:', error);
}
