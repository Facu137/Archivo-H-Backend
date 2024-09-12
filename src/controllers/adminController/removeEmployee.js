// src/controllers/adminController/removeEmployee.js
import db from '../../config/db.js'

const removeEmployee = async (req, res) => {
  const employeeId = req.params.employeeId

  if (!employeeId) {
    return res.status(400).json({ message: 'Falta el ID del empleado' })
  }

  const connection = await db.getConnection()
  try {
    // Verificar si el empleado existe
    const [employee] = await connection.query(
      'SELECT * FROM empleados WHERE persona_id = ?',
      [employeeId]
    )

    if (!employee.length) {
      return res.status(404).json({ message: 'Empleado no encontrado' })
    }

    // Verificar si el empleado es sucesor de algún administrador
    const [sucesor] = await connection.query(
      'SELECT 1 FROM administradores WHERE sucesor = ?',
      [employeeId]
    )

    if (sucesor.length > 0) {
      return res.status(400).json({
        message:
          'No se puede eliminar a un empleado que es sucesor de un administrador.'
      })
    }

    // Verificar si el empleado está activo
    if (employee[0].activo) {
      return res.status(400).json({
        message: 'No se puede eliminar a un empleado que está activo.'
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
