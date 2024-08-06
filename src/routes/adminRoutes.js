// src/routes/adminRoutes.js
import { Router } from 'express'
import adminController from '../controllers/adminController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import checkRole from '../middlewares/authMiddleware/checkRole.js'

const router = Router()

// Ruta protegida para administradores
router.get(
  '/list-possible-employees',
  verifyToken,
  checkRole(['administrador']),
  adminController.listPossibleEmployees
)
router.post(
  '/convert-to-employee',
  verifyToken,
  checkRole(['administrador']),
  adminController.convertToEmployee
)
router.put(
  '/update-search-new-employees',
  verifyToken,
  checkRole(['administrador']),
  adminController.updateSearchNewEmployees
)
router.put(
  '/update-conversion-key',
  verifyToken,
  checkRole(['administrador']),
  adminController.updateConversionKey
)
router.get(
  '/get-conversion-key/:personaId',
  verifyToken,
  checkRole(['administrador']),
  adminController.getConversionKey
)

export default router
