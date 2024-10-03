// src/routes/modifiedRoutes.js
import express from 'express'
import getModifiedDocuments from '../controllers/documentController/getModifiedFiles.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js'
const router = express.Router()

router.get(
  '/modified',
  verifyToken,
  checkRole(['administrador', 'empleado']),
  getModifiedDocuments
)

export default router
