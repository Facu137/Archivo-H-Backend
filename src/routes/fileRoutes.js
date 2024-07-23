// src/routes/fileRoutes.js

import { Router } from 'express'
import {
  uploadFile,
  getFiles,
  searchFilesByTopic,
  searchFilesByDate,
  getFileById,
  getFilesByUser
} from '../controllers/fileController.js'
import upload from '../middlewares/uploadMiddleware.js'

const router = Router()

router.post('/documents/upload', upload.single('archivo'), uploadFile)
router.get('/documents', getFiles)
router.get('/documents/search/topic', searchFilesByTopic)
router.get('/documents/search/date', searchFilesByDate)
router.get('/documents/:id', getFileById)
router.get('/documents/user/:userId', getFilesByUser)

export default router
