// backend/src/models/userModel.js
import { query } from '../db.js';

// Find a user by email.
export async function findUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email])
  return res.rows[0] || null
}



// Create a new user with hashed password.
export async function createUser({ email, passwordHash, name }) {
  const res = await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name`,
    [email, passwordHash, name]
  )
  return res.rows[0]
}

// Store a password-reset token (and expiration) for a user.
export async function setResetToken(email, token) {
  await query(
    `UPDATE users
       SET reset_token = $1,
           reset_expires = NOW() + INTERVAL '1 hour'
     WHERE email = $2`,
    [token, email]
  )
}

// Find a user by a valid reset token.
export async function findUserByResetToken(token) {
  const res = await query(
    `SELECT id FROM users
     WHERE reset_token = $1
       AND reset_expires > NOW()`,
    [token]
  )
  return res.rows[0] || null
}

// Update a user's password (and clear reset fields).
export async function updateUserPassword(userId, passwordHash) {
  await query(
    `UPDATE users
       SET password_hash = $1,
           reset_token = NULL,
           reset_expires = NULL
     WHERE id = $2`,
    [passwordHash, userId]
  )
}


// Find existing OAuth user or create a new one.
export async function findOrCreateOAuthUser({ email, name }) {
  // Try to find
  let user = await findUserByEmail(email)
  if (user) {
    return user
  }
  // Create if missing
  const res = await query(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     RETURNING id, email, name`,
    [email, name]
  )
  return res.rows[0]
}