// src/controllers/adminController/updateConversionKey.js
import db from '../../config/db.js'

const updateConversionKey = async (req, res) => {
  const { personaId, claveConversion } = req.body

  if (!personaId || !claveConversion) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos' })
  }

  const query =
    'UPDATE administradores SET clave_conversion = ? WHERE persona_id = ?'

  try {
    await db.query(query, [claveConversion, personaId])
    res.status(200).json({
      message: 'Clave de conversión actualizada con éxito',
      nuevaClave: claveConversion
    })
  } catch (err) {
    res.status(500).json({
      message: 'Error al actualizar la clave de conversión',
      error: err
    })
  }
}

export default updateConversionKey
