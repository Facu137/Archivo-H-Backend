// src/controllers/adminController/listPossibleEmployees.js
import db from '../../config/db.js'

const listPossibleEmployees = async (req, res) => {
  const connection = await db.getConnection()
  try {
    const [results] = await connection.query(
      `SELECT nombre, apellido, rol, email 
       FROM personas_usuarios pu
       JOIN usuarios u ON pu.id = u.persona_id
       WHERE u.posible_empleado = true`
    )
    res.status(200).json(results)
  } catch (error) {
    console.error('Error al listar posibles empleados:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default listPossibleEmployees
