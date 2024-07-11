import { Router } from 'express'
import authController from '../controllers/authController.js'
import verifyToken from '../middlewares/authMiddleware.js'
const router = Router()

// Routes de auth
router.post('/register', authController.register)
router.post('/login', authController.login)

// Routes de profile
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({ user: req.user })
})

export default router
