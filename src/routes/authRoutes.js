// src/routes/authRoutes.js
import { Router } from 'express'
import authController from '../controllers/authController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = Router()

// Routes de auth
router.post('/register', authController.register)
router.get('/verify-email', authController.verifyEmail)
router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)
router.put('/edit-user', verifyToken, authController.editUser)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

export default router
