// src/routes/fileRoutes.js
import { Router } from 'express'
import {
  uploadFile,
  getFiles,
  searchFilesByTopic,
  searchFilesByAuthor,
  searchFilesByDate,
  getFileById,
  getFilesByUser
} from '../controllers/fileController.js'
import upload from '../middlewares/uploadMiddleware.js'

const router = Router()

router.post('/upload', upload.single('archivo'), uploadFile)
router.get('/files', getFiles)
router.get('/files/search/topic', searchFilesByTopic)
router.get('/files/search/author', searchFilesByAuthor)
router.get('/files/search/date', searchFilesByDate)
router.get('/files/:id', getFileById)
router.get('/files/user/:userId', getFilesByUser)

export default router
