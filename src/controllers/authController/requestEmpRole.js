// src/controllers/authController/requestEmpRole.js
import db from '../../config/db.js'

const requestEmpRole = async (req, res) => {
  const { userId, claveConversion } = req.body

  if (!userId || !claveConversion) {
    return res.status(400).json({ message: 'Faltan datos requeridos' })
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    // Verificar si el usuario existe
    const [userResult] = await connection.query(
      'SELECT * FROM personas_usuarios WHERE id = ?',
      [userId]
    )

    if (!userResult.length) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const user = userResult[0]

    if (user.rol !== 'usuario') {
      return res
        .status(400)
        .json({ message: 'El usuario ya tiene un rol diferente a usuario' })
    }

    // Verificar si la clave de conversión es válida y si el administrador tiene habilitada la búsqueda de nuevos empleados
    const [adminResult] = await connection.query(
      'SELECT habilitar_busqueda_nuevos_empleados, clave_conversion FROM administradores LIMIT 1'
    )

    if (!adminResult.length) {
      return res.status(404).json({
        message: 'No se encontró un administrador para validar la clave'
      })
    }

    const admin = adminResult[0]

    if (
      !admin.habilitar_busqueda_nuevos_empleados ||
      admin.clave_conversion !== claveConversion
    ) {
      return res.status(403).json({
        message:
          'Clave de conversión inválida o búsqueda de nuevos empleados no habilitada'
      })
    }

    // Actualizar el valor de posible_empleado a true en la tabla usuarios
    await connection.query(
      'UPDATE usuarios SET posible_empleado = ? WHERE persona_id = ?',
      [true, userId]
    )

    await connection.commit()

    res
      .status(200)
      .json({ message: 'Solicitud de empleado registrada con éxito' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al solicitar el rol de empleado:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default requestEmpRole
