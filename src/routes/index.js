// src/routes/index.js
import express from 'express'
import fileRoutes from './fileRoutes.js'
import deletedRoutes from './deletedRoutes.js'
import modifiedRoutes from './modifiedRoutes.js'
import advancedRoutes from './advancedRoutes.js'
import generalRoutes from './generalRoutes.js'
import updateRefreshToken from '../middlewares/updateRefreshToken.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import healthCheck from '../controllers/healthCheck.js'

const router = express.Router()

// Health Check endpoint
router.get('/health-check', healthCheck)

// Rutas públicas (no requieren autenticación)
router.use('/general', generalRoutes)
router.use('/documents', advancedRoutes)

// Middleware para actualizar el refresh token en todas las rutas protegidas
router.use(verifyToken, updateRefreshToken)

// Rutas protegidas
router.use('/documents', fileRoutes)
router.use('/deleted', deletedRoutes)
router.use('/modified', modifiedRoutes)

export default router
