// src/models/user/promoteEmployeeToAdmin.js
import db from '../../config/db.js'

const promoteEmployeeToAdmin = async (employeeId) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    // Actualizar el rol en personas_usuarios
    await connection.query(
      'UPDATE personas_usuarios SET rol = "administrador" WHERE id = ?',
      [employeeId]
    )

    // Insertar en la tabla administradores
    await connection.query(
      'INSERT INTO administradores (persona_id, habilitar_busqueda_nuevos_empleados, clave_conversion) VALUES (?, ?, ?)',
      [employeeId, false, '123456']
    )

    // Eliminar de la tabla empleados
    await connection.query('DELETE FROM empleados WHERE persona_id = ?', [
      employeeId
    ])

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default promoteEmployeeToAdmin
