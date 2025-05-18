// backend/src/controllers/authController.js
import bcrypt         from 'bcrypt';
import jwt            from 'jsonwebtoken';
import dotenv         from 'dotenv';
import crypto from 'crypto'
import { query } from '../db.js'
import { sendResetEmail } from '../utils/emailService.js'
import fetch from 'node-fetch' // for Google verification
import {
  findUserByEmail,
  createUser,
  setResetToken,
  findUserByResetToken,
  updateUserPassword,
  findOrCreateOAuthUser,
} from '../models/userModel.js'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.FRONTEND_URL;

// — Sign Up
export async function signUp(req, res) {
  const { email, password, name } = req.body
  if (await findUserByEmail(email)) {
    return res.status(409).json({ message: 'User already exists.' })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await createUser({ email, passwordHash, name })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
  res.json({ user })
}

// — Sign In
export async function signIn(req, res) {
  const { email, password } = req.body
  const user = await findUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
  delete user.password_hash
  res.json({ user })
}

// — Forgot Password
export async function forgotPassword(req, res) {
  const { email } = req.body
  const token = crypto.randomBytes(20).toString('hex')
  await setResetToken(email, token)
  sendResetEmail(email, `${CLIENT_URL}/reset-password?token=${token}`)
  res.json({ message: 'Password reset email sent.' })
}


// — Reset Password
export async function resetPassword(req, res) {
  const { token, password } = req.body
  const row = await findUserByResetToken(token)
  if (!row) {
    return res.status(400).json({ message: 'Invalid or expired token.' })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await updateUserPassword(row.id, passwordHash)
  res.json({ message: 'Password has been reset.' })
}


// — Google SSO redirect
export function googleAuth(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${CLIENT_URL}/api/auth/google/callback`
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&redirect_uri=${redirectUri}` +
    `&response_type=code&scope=openid%20email%20profile`
  res.redirect(url)
}


// — Google SSO callback
export async function googleAuthCallback(req, res) {
  const code = req.query.code
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${CLIENT_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  }).then(r => r.json())
  const userinfo = await fetch(
    `https://openidconnect.googleapis.com/v1/userinfo`,
    { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
  ).then(r => r.json())
  const { email, name } = userinfo
  const user = await findOrCreateOAuthUser({ email, name })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
  res.redirect(CLIENT_URL)
}

// — Get current user
export async function getMe(req, res) {
  try {
    const { token } = req.cookies
    const { userId } = jwt.verify(token, JWT_SECRET)
    const user = await findUserByEmail(userId)
    res.json({ user })
  } catch {
    res.status(401).json({ message: 'Not authenticated' })
  }
}

// — Sign Out
export function signOut(req, res) {
  res.clearCookie('token')
  res.json({ message: 'Signed out' })
}
