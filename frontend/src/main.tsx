import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGoogleAuth, onGoogleSignIn } from './utils/googleAuth';

console.log("🌱 import.meta.env =", import.meta.env);

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error("Could not find #root container");
}

function setupGoogle() {
  // expose the callback globally for the button's data-onsuccess
  // @ts-ignore
  window.onSignIn = (googleUser: any) => onGoogleSignIn(googleUser, apiBaseUrl);

  initGoogleAuth(clientId);
}

// run once on startup
setupGoogle();