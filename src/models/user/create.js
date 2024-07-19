import db from '../../config/db.js'

const create = async (user) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.query(
      'INSERT INTO personas_usuarios (email, contrasena, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)',
      [
        user.email,
        user.password,
        user.nombre,
        user.apellido,
        user.rol || 'usuario'
      ]
    )

    const userId = result.insertId

    if (user.rol === 'usuario') {
      await connection.query(
        'INSERT INTO usuarios (persona_id, posible_empleado) VALUES (?, ?)',
        [userId, user.posible_empleado || false]
      )
    } else if (user.rol === 'empleado') {
      await connection.query(
        'INSERT INTO empleados (persona_id, activo, permiso_crear, permiso_editar, permiso_eliminar, permiso_descargar, permiso_ver_archivos_privados) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          user.activo || false,
          user.permiso_crear || false,
          user.permiso_editar || false,
          user.permiso_eliminar || false,
          user.permiso_descargar || false,
          user.permiso_ver_archivos_privados || false
        ]
      )
    } else if (user.rol === 'administrador') {
      await connection.query(
        'INSERT INTO administradores (persona_id, habilitar_busqueda_nuevos_empleados, clave_conversion) VALUES (?, ?, ?)',
        [
          userId,
          user.habilitar_busqueda_nuevos_empleados || false,
          user.clave_conversion || '123456'
        ]
      )
    }

    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default create
