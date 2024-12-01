// src/routes/index.js
import express from 'express'
import authRoutes from './authRoutes.js'
import fileRoutes from './fileRoutes.js'
import adminRoutes from './adminRoutes.js'
import deletedRoutes from './deletedRoutes.js'
import modifiedRoutes from './modifiedRoutes.js'
import advancedRoutes from './advancedRoutes.js'
import generalRoutes from './general.js'
import updateRefreshToken from '../middlewares/updateRefreshToken.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes)
router.use('/general', generalRoutes)

// Middleware para actualizar el refresh token en todas las rutas protegidas
router.use(verifyToken, updateRefreshToken)

// Rutas protegidas
router.use('/files', fileRoutes)
router.use('/admin', adminRoutes)
router.use('/deleted', deletedRoutes)
router.use('/modified', modifiedRoutes)
router.use('/advanced', advancedRoutes)

export default router
