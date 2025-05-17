
// Simple user store for authentication (in a real app, this would use proper backend auth)
import { toast } from "@/hooks/use-toast";
import { HubSpotCredentials } from "./types/workflow";

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed on the server
  name?: string;
  phone?: string; // Added phone property
  createdAt: string;
  hubspot_connected?: boolean;
  hubspot_credentials?: HubSpotCredentials;
  hubspot_token?: string;
  hubspot_refresh_token?: string;
  hubspot_token_expires_at?: number;
}

// In-memory user store (in a real app, this would be a database)
const users: User[] = [];

// Current logged-in user
let currentUser: User | null = null;

// Check if there's a session in localStorage on initialization
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

// Call initialization
initializeSession();

export const signUp = (email: string, password: string, name?: string): boolean => {
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    toast({
      title: "Registration failed",
      description: "This email is already registered.",
      variant: "destructive"
    });
    return false;
  }

  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    password, // In a real app, this would be hashed
    name,
    createdAt: new Date().toISOString(),
  };

  // Save user
  users.push(newUser);
  
  // Save to localStorage for persistence
  localStorage.setItem('users', JSON.stringify(users));
  
  // Auto-login the new user
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  toast({
    title: "Registration successful",
    description: "Your account has been created.",
  });
  
  return true;
};

export const signIn = (email: string, password: string): boolean => {
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    toast({
      title: "Login failed",
      description: "Invalid email or password.",
      variant: "destructive"
    });
    return false;
  }
  
  // Set as current user
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  toast({
    title: "Login successful",
    description: "Welcome back!",
  });
  
  return true;
};

export const signOut = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  toast({
    title: "Logged out",
    description: "You have been logged out.",
  });
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

// Add HubSpot connection methods
export const connectHubSpot = (credentials: HubSpotCredentials): boolean => {
  if (!currentUser) {
    toast({
      title: "Authentication required",
      description: "Please sign in to connect HubSpot.",
      variant: "destructive"
    });
    return false;
  }
  
  // Update user with HubSpot credentials
  currentUser.hubspot_connected = true;
  currentUser.hubspot_credentials = credentials;
  
  // Update in users array
  const userIndex = users.findIndex(u => u.id === currentUser?.id);
  if (userIndex >= 0) {
    users[userIndex] = { ...currentUser };
  }
  
  // Update localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('users', JSON.stringify(users));
  
  toast({
    title: "HubSpot Connected",
    description: "Your HubSpot CRM account has been connected successfully.",
  });
  
  return true;
};

export const disconnectHubSpot = (): boolean => {
  if (!currentUser) {
    return false;
  }
  
  // Remove HubSpot credentials
  currentUser.hubspot_connected = false;
  delete currentUser.hubspot_credentials;
  
  // Update in users array
  const userIndex = users.findIndex(u => u.id === currentUser?.id);
  if (userIndex >= 0) {
    users[userIndex] = { ...currentUser };
  }
  
  // Update localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('users', JSON.stringify(users));
  
  toast({
    title: "HubSpot Disconnected",
    description: "Your HubSpot CRM account has been disconnected.",
  });
  
  return true;
};

// Load users from localStorage on module initialization
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
