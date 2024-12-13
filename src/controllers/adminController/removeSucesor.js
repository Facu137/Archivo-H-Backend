// src/controllers/adminController/removeSucesor.js
import db from '../../config/db.js'

const removeSucesor = async (req, res) => {
  const adminId = req.params.adminId

  if (!adminId) {
    return res.status(400).json({ message: 'Falta el ID del administrador' })
  }

  const connection = await db.getConnection()
  try {
    // Verificar si el administrador existe
    const [admin] = await connection.query(
      'SELECT * FROM administradores WHERE persona_id = ?',
      [adminId]
    )

    if (!admin.length) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    // Actualizar el sucesor a NULL en la tabla administradores
    await connection.query(
      'UPDATE administradores SET sucesor = NULL WHERE persona_id = ?',
      [adminId]
    )

    res.status(200).json({ message: 'Sucesor eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar el sucesor:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default removeSucesor
