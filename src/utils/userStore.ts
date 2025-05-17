
// Simple user store for authentication (in a real app, this would use proper backend auth)
import { toast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed on the server
  name?: string;
  phone?: string; // Added phone property
  createdAt: string;
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
