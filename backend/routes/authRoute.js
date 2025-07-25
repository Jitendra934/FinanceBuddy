const express = require('express')
const authRouter = express.Router();
const authMiddleWare = require('../middleware/authMiddleware');
const { signUp , signIn , verifyEmail, sendResetVerificationCode, resetPassword, isAuthenticated, checkAuth } = require('../controllers/authController');
const sanitizeMiddleware = require('../middleware/sanitizeMiddleware');

authRouter.post('/signup', sanitizeMiddleware, signUp)
authRouter.post('/signin', sanitizeMiddleware, signIn)
authRouter.get('/check-auth',authMiddleWare , checkAuth)
authRouter.post('/verify-email', authMiddleWare, verifyEmail)
authRouter.post('/send-reset-password-code', sendResetVerificationCode)
authRouter.post('/reset-password', resetPassword)
authRouter.get('is-authenticated', authMiddleWare, isAuthenticated)

module.exports = authRouter
