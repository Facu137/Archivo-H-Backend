// src/routes/advancedRoutes.js
import express from 'express'
import getAdvancedSearch from '../controllers/documentController/listDocumentsAdvanced.js'

const router = express.Router()

router.get('/advanced-search', getAdvancedSearch)

export default router
