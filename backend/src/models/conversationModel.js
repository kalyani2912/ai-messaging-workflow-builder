// backend/src/models/conversationModel.js
import pool from '../db.js';  // your existing PG pool setup

/**
 * Insert or update the conversation history for a draft.
 * @param {number} userId 
 * @param {Array<Object>} messages 
 * @returns {Promise<Object>} the new row
 */
export async function upsertConversation(userId, messages) {
  const text = `
    INSERT INTO conversations (user_id, messages)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [userId, messages];
  const res = await pool.query(text, values);
  return res.rows[0];
}
