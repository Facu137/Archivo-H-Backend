// src/routes/fileRoutes.js
import { Router } from 'express'
import {
  uploadFileGeneral,
  uploadFileMensura,
  uploadFileNotarial
} from '../controllers/fileController/index.js'
import upload from '../middlewares/uploadMiddleware.js'

const router = Router()

// Rutas para subir archivos
router.post(
  '/documents/upload/general',
  upload.single('archivo'),
  uploadFileGeneral
)
router.post(
  '/documents/upload/notarial',
  upload.single('archivo'),
  uploadFileGeneral,
  uploadFileNotarial
)
router.post(
  '/documents/upload/mensura',
  upload.single('archivo'),
  uploadFileGeneral,
  uploadFileMensura
)

export default router
