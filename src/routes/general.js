// src/routes/generalRoutes.js
import express from 'express'
import getGeneral from '../controllers/documentController/getGeneral.js'
import checkPermission from '../middlewares/authMiddleware/checkPermission.js'

const router = express.Router()

router.get(
  '/general',
  getGeneral
)

export default router
