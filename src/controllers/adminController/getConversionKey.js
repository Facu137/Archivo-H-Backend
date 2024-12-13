// src/controllers/adminController/getConversionKey.js
import db from '../../config/db.js'

const getConversionKey = async (req, res) => {
  const { personaId } = req.params

  if (!personaId) {
    return res.status(400).json({ message: 'Falta el parámetro personaId' })
  }

  const query =
    'SELECT clave_conversion FROM administradores WHERE persona_id = ?'

  try {
    const [results] = await db.query(query, [personaId])
    if (results.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }
    res.status(200).json({
      claveConversion: results[0].clave_conversion
    })
  } catch (err) {
    res.status(500).json({
      message: 'Error al obtener la clave de conversión',
      error: err
    })
  }
}

export default getConversionKey
