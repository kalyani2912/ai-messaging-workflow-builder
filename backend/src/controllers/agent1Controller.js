// backend/src/controllers/agent1Controller.js

import agent1Service from '../services/agent1Service.js';
import { upsertConversation } from '../models/conversationModel.js';
import { createWorkflowDraft } from '../models/workflowDraftModel.js';

/**
 * POST /api/agent1/chat
 * Expects: { messages: Array<{ role: 'user'|'assistant', content: string }> }
 * Returns: { assistantMessage: string, specComplete: boolean, spec?: object }
 */
export async function postMessage(req, res, next) {
  try {

    // 1) Get the authenticated user
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = user.id;

    // 2. Grab the array of all messages from the client
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid "messages" array' });
    }

    // 3. Persist the entire chat history for this user
    await upsertConversation(userId, messages);

    // 4. Call your service to get the assistant's reply (and spec status) i.e Generate AI response & spec insight
    const { assistantMessage, specComplete, spec } = await agent1Service.chat(messages);

    // 5. If spec is complete, save it as a draft
    if (specComplete && spec) {
      await createWorkflowDraft(userId, spec);
    }


    // 6. Return it to the frontend
    return res.json({ assistantMessage, specComplete, spec });
    
  } catch (err) {
    // Let your global error handler catch/log it
    return next(err);
  }
}
