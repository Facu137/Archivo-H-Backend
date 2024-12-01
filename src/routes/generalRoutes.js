// src/routes/generalRoutes.js
import express from 'express'
import getGeneral from '../controllers/documentController/getGeneral.js'

const router = express.Router()

router.get('/', getGeneral)

export default router
