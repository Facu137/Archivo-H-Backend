// src/routes/adminRoutes.js
import { Router } from 'express'
import listPossibleEmployees from '../controllers/adminController/listPossibleEmployees.js'
import convertToEmployee from '../controllers/adminController/convertToEmployee.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import checkRole from '../middlewares/authMiddleware/checkRole.js'

const router = Router()

// Ruta protegida para administradores
router.get(
  '/list-possible-employees',
  verifyToken,
  checkRole(['administrador']),
  listPossibleEmployees
)
router.post(
  '/convert-to-employee',
  verifyToken,
  checkRole(['administrador']),
  convertToEmployee
)

export default router
