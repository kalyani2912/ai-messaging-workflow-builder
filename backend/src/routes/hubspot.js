// backend/src/routes/hubspot.js
import express from 'express';
import fetch   from 'node-fetch';

const router = express.Router();
// Read the token you just put in .env:
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

// Health check: is the token present and valid?
router.get('/health', async (req, res) => {
  if (!TOKEN) {
    return res.json({ connected: false });
  }
  // Quick verify by fetching 1 contact:
  const resp = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  return resp.ok
    ? res.json({ connected: true })
    : res.json({ connected: false, error: 'Invalid token or scopes' });
});

// Fetch all contacts:
router.get('/contacts', async (req, res) => {
  const resp = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!resp.ok) {
    const err = await resp.text();
    return res.status(resp.status).json({ error: err });
  }
  const data = await resp.json();
  res.json(data);
});

// (Later: add /meetings, etc.)

export default router;
