// src/routes/fileRoutes.js
import { Router } from 'express'
import {
  uploadFileGeneral,
  uploadFileMensura,
  uploadFileNotarial,
  getFiles,
  searchFilesByTopic,
  searchFilesByDate,
  getFileById,
  getFilesByUser
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

// Otras rutas relacionadas con archivos
router.get('/documents', getFiles)
router.get('/documents/search/topic', searchFilesByTopic)
router.get('/documents/search/date', searchFilesByDate)
router.get('/documents/:id', getFileById)
router.get('/documents/user/:userId', getFilesByUser)

export default router
