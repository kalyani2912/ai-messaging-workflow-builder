import { Router } from 'express';
import { postMessage } from '../controllers/agent1Controller.js';

const router = Router();

// POST /api/agent1/chat
router.post('/chat', postMessage);

export default router;
