// src/routes/deletedRoutes.js
import express from 'express'
import getDeletedDocuments from '../controllers/documentController/getDeletedFiles.js'
import deleteDocument from '../controllers/documentController/deleteDocument.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/deleted', getDeletedDocuments) // Esta ruta puede quedar sin restricción o agregar las que se necesiten
router.delete('/documents/:id', verifyToken, deleteDocument)

export default router
