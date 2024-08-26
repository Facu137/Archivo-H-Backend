import express from 'express'
import getDeletedDocuments from '../controllers/documentController/getDeletedFiles.js'
import deleteDocument from '../controllers/documentController/deleteDocument.js'

const router = express.Router()

router.get('/deleted', getDeletedDocuments)
router.delete('/documents/:id', deleteDocument)

export default router
