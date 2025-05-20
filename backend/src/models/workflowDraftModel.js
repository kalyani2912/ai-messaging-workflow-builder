// backend/src/models/workflowDraftModel.js
import pool from '../db.js';

/**
 * Save the finalized workflow spec.
 * @param {number} userId
 * @param {Object} spec
 * @returns {Promise<Object>} the new draft row
 */
export async function createWorkflowDraft(userId, spec) {
  const text = `
    INSERT INTO workflow_drafts (user_id, spec)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [userId, spec];
  const res = await pool.query(text, values);
  return res.rows[0];
}
