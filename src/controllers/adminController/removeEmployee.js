// src/controllers/adminController/removeEmployee.js
import db from '../../config/db.js'

const removeEmployee = async (req, res) => {
  const employeeId = req.params.employeeId

  if (!employeeId) {
    return res.status(400).json({ message: 'Falta el ID del empleado' })
  }

  const connection = await db.getConnection()
  try {
    // Verificar si el empleado existe, no está activo y no es sucesor
    const [employee] = await connection.query(
      `SELECT * 
       FROM empleados e
       LEFT JOIN administradores a ON e.persona_id = a.sucesor
       WHERE e.persona_id = ? AND e.activo = 0 AND a.sucesor IS NULL`,
      [employeeId]
    )

    if (!employee.length) {
      return res.status(404).json({
        message:
          'Empleado no encontrado, está activo o es sucesor del administrador'
      })
    }

    await connection.beginTransaction()

    // Actualizar el rol en personas_usuarios a 'usuario'
    await connection.query(
      'UPDATE personas_usuarios SET rol = "usuario" WHERE id = ?',
      [employeeId]
    )

    // Eliminar de la tabla empleados
    await connection.query('DELETE FROM empleados WHERE persona_id = ?', [
      employeeId
    ])

    await connection.commit()

    res.status(200).json({ message: 'Empleado eliminado correctamente' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al eliminar empleado:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default removeEmployee
