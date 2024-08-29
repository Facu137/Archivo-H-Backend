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
  adminController.listPossibleEmployees // listar posibles empleados
)
router.post(
  '/convert-to-employee',
  verifyToken,
  checkRole(['administrador']),
  adminController.convertToEmployee // convertir a Empleado
)
router.put(
  '/cancel-employee-conversion',
  verifyToken,
  checkRole(['administrador']),
  adminController.cancelEmployeeConversion // cancelar Conversión
)
router.get(
  '/get-search-status/:personaId',
  verifyToken,
  checkRole(['administrador']),
  adminController.getSearchStatus // obtener estado activado o desactivado de Busqueda de Nuevos Empleados
)
router.put(
  '/update-search-new-employees',
  verifyToken,
  checkRole(['administrador']),
  adminController.updateSearchNewEmployees // habilitar o deshabilitar Busqueda de Nuevos Empleados
)
router.put(
  '/update-conversion-key',
  verifyToken,
  checkRole(['administrador']),
  adminController.updateConversionKey // actualizar Clave de Conversión
)
router.get(
  '/get-conversion-key/:personaId',
  verifyToken,
  checkRole(['administrador']),
  adminController.getConversionKey // obtener Clave de Conversión
)
router.get(
  '/list-employees',
  verifyToken,
  checkRole(['administrador']),
  adminController.listEmployees // listar Empleados
)
router.put(
  '/update-employee/:employeeId',
  verifyToken,
  checkRole(['administrador']),
  adminController.updateEmployee // actualizar Empleado
)
router.get(
  '/get-successor/:adminId', // Nueva ruta
  verifyToken,
  checkRole(['administrador']),
  adminController.getSucesor // mostrar Sucesor actual
)
router.post(
  '/set-successor',
  verifyToken,
  checkRole(['administrador']),
  adminController.setSucesor // establecer Sucesor
)
router.delete(
  '/remove-employee/:employeeId',
  verifyToken,
  checkRole(['administrador']),
  adminController.removeEmployee // eliminar Empleado y volverlo un usuario
)
export default router
