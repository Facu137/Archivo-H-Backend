// src/routes/fileRoutes.js
import express from 'express'
import {
  uploadFileGeneral,
  uploadFileMensura,
  uploadFileNotarial
} from '../controllers/fileController/index.js'
import upload from '../middlewares/uploadMiddleware.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js' // Importar los middlewares
import { convertToAvif } from '../middlewares/imageConverter.js' // Added import for convertToAvif middleware

const router = express.Router()

router.use(express.urlencoded({ extended: true })) // Agrega este middleware

// Rutas para subir archivos (con middleware de autenticación)
router.post(
  '/upload/general',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  convertToAvif, // Integrated convertToAvif middleware
  uploadFileGeneral
)
router.post(
  '/upload/notarial',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  convertToAvif, // Integrated convertToAvif middleware
  uploadFileGeneral,
  uploadFileNotarial
)
router.post(
  '/upload/mensura',
  verifyToken, // Verificar el token
  checkRole(['empleado', 'administrador']), // Verificar el rol
  upload.array('archivo'),
  convertToAvif, // Integrated convertToAvif middleware
  uploadFileGeneral,
  uploadFileMensura
)

// ... otras rutas

export default router
