import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("🌱 import.meta.env =", import.meta.env);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error("Could not find #root container");
}