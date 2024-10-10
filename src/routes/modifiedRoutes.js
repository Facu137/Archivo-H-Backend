// src/routes/modifiedRoutes.js
import express from 'express'
import getModifiedDocuments from '../controllers/documentController/getModifiedFiles.js'
import {
  verifyToken,
  checkRole,
  checkPermission
} from '../middlewares/authMiddleware.js'
import modifyRecord from '../controllers/documentController/modifyFile.js'

const router = express.Router()

router.get(
  '/modified',
  verifyToken,
  checkRole(['administrador', 'empleado']),
  getModifiedDocuments
)

router.put(
  '/:id',
  verifyToken, // Verificar token JWT
  checkRole(['administrador', 'empleado']), // Verificar rol
  checkPermission('permiso_editar'), // Verificar permiso de edición
  async (req, res) => {
    const { id } = req.params
    const { tabla, campos, tipoDocumento } = req.body

    try {
      await modifyRecord(tabla, id, campos, req, res, tipoDocumento)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error al modificar el registro' })
    }
  }
)

export default router
