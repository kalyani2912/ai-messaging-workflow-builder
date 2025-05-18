// backend/src/routes/auth.js
import express from 'express';
import {
  signUp, signIn, forgotPassword,
  resetPassword,
  getMe, signOut, googleLogin
} from '../controllers/authController.js'

const router = express.Router();
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/me', getMe)
router.post('/signout', signOut)
router.post('/google-login', googleLogin);


export default router;