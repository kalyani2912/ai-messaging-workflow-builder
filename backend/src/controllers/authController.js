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

import { OAuth2Client } from 'google-auth-library';
const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export async function googleLogin(req, res) {
  const { idToken } = req.body;
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub, email, name, picture } = ticket.getPayload();
    const user = await findOrCreateOAuthUser({
      oauthId: sub,
      email,
      name,
      picture
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user });
  } catch {
    res.status(401).json({ message: 'Invalid ID token' });
  }
}

