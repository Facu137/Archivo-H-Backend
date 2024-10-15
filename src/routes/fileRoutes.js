// src/routes/fileRoutes.js
import { Router } from 'express'
import {
  uploadFileGeneral,
  uploadFileMensura,
  uploadFileNotarial
} from '../controllers/fileController/index.js'
import upload from '../middlewares/uploadMiddleware.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js' // Importar los middlewares

const router = Router()

// Rutas para subir archivos (con middleware de autenticación)
router.post(
  '/documents/upload/general',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  uploadFileGeneral
)
router.post(
  '/documents/upload/notarial',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  uploadFileGeneral,
  uploadFileNotarial
)
router.post(
  '/documents/upload/mensura',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  uploadFileGeneral,
  uploadFileMensura
)

// ... otras rutas

export default router
