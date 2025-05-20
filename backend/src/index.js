// backend/src/index.js
import express        from 'express';
import cors           from 'cors';
import dotenv         from 'dotenv';
import authRoutes     from './routes/auth.js';
import hubspotRoutes  from './routes/hubspot.js';
import cookieParser from 'cookie-parser'
import openai from './config/openaiConfig.js';
import agent1Routes from './routes/agent1Routes.js';


dotenv.config();

const app = express();
//const agent1Routes = require('./routes/agent1Routes'); // we’ll make this later

// Request logger
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});


// 🛡️ Middleware: Express + CORS + cookies
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// Mount auth routes under /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/hubspot', hubspotRoutes);

// 5. Mount Agent-1 chat endpoint
app.use('/api/agent1', agent1Routes);

// Fallback for anything else
app.use((req, res) => {
  console.log(`✖ No route for ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Not Found' });
});


// ... any other routes ...
const PORT = parseInt(process.env.PORT, 10) || 3001;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));