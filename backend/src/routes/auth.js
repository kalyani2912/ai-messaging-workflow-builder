// backend/src/routes/auth.js
import express from 'express';
import {
  signUp, signIn, forgotPassword,
  resetPassword, googleAuth, googleAuthCallback,
  getMe, signOut
} from '../controllers/authController.js'

const router = express.Router();
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/google', googleAuth)
router.get('/google/callback', googleAuthCallback)
router.get('/me', getMe)
router.post('/signout', signOut)

export default router;