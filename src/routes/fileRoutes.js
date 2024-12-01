// src/routes/fileRoutes.js
import express from 'express'
import {
  uploadFileGeneral,
  uploadFileMensura,
  uploadFileNotarial
} from '../controllers/fileController/index.js'
import upload from '../middlewares/uploadMiddleware.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js' // Importar los middlewares

const router = express.Router()

router.use(express.urlencoded({ extended: true })) // Agrega este middleware

// Rutas para subir archivos (con middleware de autenticación)
router.post(
  '/upload/general',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  uploadFileGeneral
)
router.post(
  '/upload/notarial',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  uploadFileGeneral,
  uploadFileNotarial
)
router.post(
  '/upload/mensura',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  uploadFileGeneral,
  uploadFileMensura
)

export default router
