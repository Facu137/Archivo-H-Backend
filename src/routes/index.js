// src/routes/index.js
import express from 'express'
import fileRoutes from './fileRoutes.js'
import adminRoutes from './adminRoutes.js'
import deletedRoutes from './deletedRoutes.js'
import modifiedRoutes from './modifiedRoutes.js'
import advancedRoutes from './advancedRoutes.js'
import generalRoutes from './general.js'
import updateRefreshToken from '../middlewares/updateRefreshToken.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import healthCheck from '../controllers/healthCheck.js'

const router = express.Router()

// Health Check endpoint
router.get('/health-check', healthCheck)

// Rutas públicas (no requieren autenticación)
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
