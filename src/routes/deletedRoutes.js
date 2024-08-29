// src/routes/deletedRoutes.js
import express from 'express'
import getDeletedDocuments from '../controllers/documentController/getDeletedFiles.js'
import deleteDocument from '../controllers/documentController/deleteDocument.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Ruta para obtener documentos eliminados (solo para administradores y empleados)
router.get(
  '/deleted',
  verifyToken,
  checkRole(['administrador', 'empleado']),
  getDeletedDocuments
)

// Ruta para eliminar documentos (ya tiene el middleware verifyToken)
router.delete('/documents/:id', verifyToken, deleteDocument)

export default router
