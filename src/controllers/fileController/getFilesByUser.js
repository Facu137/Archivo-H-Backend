import pool from '../../config/db.js'

const getFileUrl = (filename) => {
  return `http://localhost:3000/uploads/${filename}`
}

export const getFilesByUser = async (req, res) => {
  const { userId } = req.params
  try {
    const [rows] = await pool.query(
      `
      SELECT d.*, i.url, i.tipo_imagen 
      FROM documentos d 
      LEFT JOIN imagenes i ON d.id = i.documento_id
      WHERE d.creador_id = ?
    `,
      [userId]
    )
    const filesWithUrl = rows.map((file) => ({
      ...file,
      url: file.url ? getFileUrl(file.url) : null
    }))
    res.json(filesWithUrl)
  } catch (error) {
    console.error('Error al obtener documentos por usuario:', error)
    res.status(500).send('Error al obtener documentos por usuario')
  }
}
