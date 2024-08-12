// src\routes\general.js
import express from 'express'
import getGeneral from '../controllers/documentController/getGeneral.js'
const router = express.Router()

// Definir la ruta para obtener datos generales con búsqueda
router.get('/general', getGeneral)

export default router
