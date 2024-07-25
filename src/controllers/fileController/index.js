// src/controllers/fileController/index.js
import { uploadFileGeneral } from './uploadFileGeneral.js'
import { uploadFileMensura } from './uploadFileMensura.js'
import { uploadFileNotarial } from './uploadFileNotarial.js'
import { getFiles } from './getFiles.js'
import { searchFilesByTopic } from './searchFilesByTopic.js'
import { searchFilesByDate } from './searchFilesByDate.js'
import { getFileById } from './getFilesById.js'
import { getFilesByUser } from './getFilesByUser.js'

export {
  uploadFileGeneral,
  uploadFileMensura,
  uploadFileNotarial,
  getFiles,
  searchFilesByTopic,
  searchFilesByDate,
  getFileById,
  getFilesByUser
}
