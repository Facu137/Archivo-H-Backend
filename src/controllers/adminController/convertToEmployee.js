// src/controllers/adminController/convertToEmployee.js
import db from '../../config/db.js'

const convertToEmployee = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ message: 'Faltan datos requeridos' })
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    // Verificar si el usuario existe y tiene posible_empleado en true
    const [userResult] = await connection.query(
      `SELECT * 
       FROM personas_usuarios pu
       JOIN usuarios u ON pu.id = u.persona_id
       WHERE pu.id = ? AND u.posible_empleado = true`,
      [userId]
    )

    if (!userResult.length) {
      return res
        .status(404)
        .json({ message: 'Usuario no encontrado o no es un posible empleado' })
    }

    // Insertar en la tabla empleados con permisos iniciales en false y activo en false
    await connection.query(
      `INSERT INTO empleados (persona_id, activo, permiso_crear, permiso_editar, permiso_eliminar, permiso_descargar, permiso_ver_archivos_privados)
       VALUES (?, false, false, false, false, false, false)`,
      [userId]
    )

    // Actualizar el rol en personas_usuarios a 'empleado'
    await connection.query(
      `UPDATE personas_usuarios 
       SET rol = 'empleado' 
       WHERE id = ?`,
      [userId]
    )

    // Eliminar de la tabla usuarios
    await connection.query(
      `DELETE FROM usuarios 
       WHERE persona_id = ?`,
      [userId]
    )

    await connection.commit()

    res.status(200).json({ message: 'Usuario convertido a empleado con éxito' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al convertir a empleado:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default convertToEmployee
