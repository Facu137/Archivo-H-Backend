// src/routes/deletedRoutes.js
import express from 'express'
import getDeletedDocuments from '../controllers/documentController/getDeletedFiles.js'
import deleteDocument from '../controllers/documentController/deleteDocument.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js'
import restoreDeletedFiles from '../controllers/documentController/restoreDeletedFiles.js'
import deleteDocumentPermanently from '../controllers/documentController/deleteDocumentPermanently.js'
const router = express.Router()

// Ruta para obtener documentos eliminados (solo para administradores y empleados)
router.get(
  '/deleted',
  verifyToken,
  checkRole(['administrador', 'empleado']),
  getDeletedDocuments
)
router.delete(
  '/documents/:documentoId/permanente',
  verifyToken,
  checkRole(['administrador']),
  deleteDocumentPermanently
)

// Ruta para eliminar documentos (ya tiene el middleware verifyToken)
router.delete('/documents/:id', verifyToken, deleteDocument)

// Ruta para restaurar documentos eliminados (solo para administradores y empleados)
router.put(
  '/documents/:documentoId/restore',
  verifyToken,
  checkRole(['administrador', 'empleado']),
  restoreDeletedFiles
)
export default router
