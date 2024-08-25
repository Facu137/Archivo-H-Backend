// src/controllers/adminController/setSucesor.js
import db from '../../config/db.js'

const setSucesor = async (req, res) => {
  const { adminId, employeeId } = req.body

  if (!adminId || !employeeId) {
    return res.status(400).json({ message: 'Faltan datos requeridos' })
  }

  const connection = await db.getConnection()
  try {
    // Verificar si el administrador y el empleado existen
    const [admin] = await connection.query(
      'SELECT * FROM administradores WHERE persona_id = ?',
      [adminId]
    )
    const [employee] = await connection.query(
      'SELECT * FROM empleados WHERE persona_id = ? AND activo = 1',
      [employeeId]
    )

    if (!admin.length) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    if (!employee.length) {
      return res
        .status(404)
        .json({ message: 'Empleado no encontrado o no está activo' })
    }

    // Actualizar el sucesor en la tabla administradores
    await connection.query(
      'UPDATE administradores SET sucesor = ? WHERE persona_id = ?',
      [employeeId, adminId]
    )

    res.status(200).json({ message: 'Sucesor establecido correctamente' })
  } catch (error) {
    console.error('Error al establecer sucesor:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default setSucesor