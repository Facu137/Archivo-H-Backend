// src/controllers/adminController/getSucesor.js
import db from '../../config/db.js'

const getSucesor = async (req, res) => {
  const adminId = req.params.adminId

  if (!adminId) {
    return res.status(400).json({ message: 'Falta el ID del administrador' })
  }

  const connection = await db.getConnection()
  try {
    // Obtener el sucesor del administrador y su información de usuario
    const [result] = await connection.query(
      `SELECT 
        a.sucesor as sucesorId, 
        pu.nombre AS sucesorNombre, 
        pu.apellido AS sucesorApellido,
        pu.email AS sucesorEmail,
        pu.rol AS sucesorRol
      FROM administradores a
      LEFT JOIN personas_usuarios pu ON a.sucesor = pu.id
      WHERE a.persona_id = ?`,
      [adminId]
    )

    if (result.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    // Si no hay sucesor, devolver un mensaje
    if (!result[0].sucesorId) {
      return res.status(200).json({ message: 'No tiene sucesor asignado.' })
    }

    // Devolver la información del sucesor
    res.status(200).json({
      sucesor: {
        id: result[0].sucesorId,
        nombre: result[0].sucesorNombre,
        apellido: result[0].sucesorApellido,
        email: result[0].sucesorEmail,
        rol: result[0].sucesorRol
      }
    })
  } catch (error) {
    console.error('Error al obtener el sucesor:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default getSucesor
