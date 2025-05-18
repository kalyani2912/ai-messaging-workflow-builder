import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("🌱 import.meta.env =", import.meta.env);

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error("Could not find #root container");
}
