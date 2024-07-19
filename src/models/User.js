import db from '../config/db.js'

const User = {
  create: async (user) => {
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
  },

  findByEmail: async (email) => {
    const [results] = await db.query(
      `SELECT pu.*, 
        u.posible_empleado, 
        e.activo, e.permiso_crear, e.permiso_editar, e.permiso_eliminar, e.permiso_descargar, e.permiso_ver_archivos_privados,
        a.habilitar_busqueda_nuevos_empleados, a.clave_conversion
      FROM personas_usuarios pu
      LEFT JOIN usuarios u ON pu.id = u.persona_id
      LEFT JOIN empleados e ON pu.id = e.persona_id
      LEFT JOIN administradores a ON pu.id = a.persona_id
      WHERE pu.email = ?`,
      [email]
    )
    return results[0]
  },

  findById: async (id) => {
    const [results] = await db.query(
      `SELECT pu.*, 
        u.posible_empleado, 
        e.activo, e.permiso_crear, e.permiso_editar, e.permiso_eliminar, e.permiso_descargar, e.permiso_ver_archivos_privados,
        a.habilitar_busqueda_nuevos_empleados, a.clave_conversion
      FROM personas_usuarios pu
      LEFT JOIN usuarios u ON pu.id = u.persona_id
      LEFT JOIN empleados e ON pu.id = e.persona_id
      LEFT JOIN administradores a ON pu.id = a.persona_id
      WHERE pu.id = ?`,
      [id]
    )
    return results[0]
  },

  updateRefreshToken: async (userId, refreshToken) => {
    await db.query(
      'UPDATE personas_usuarios SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    )
  },

  findByRefreshToken: async (refreshToken) => {
    const [results] = await db.query(
      'SELECT * FROM personas_usuarios WHERE refresh_token = ?',
      [refreshToken]
    )
    return results[0]
  },

  removeRefreshToken: async (userId) => {
    await db.query(
      'UPDATE personas_usuarios SET refresh_token = NULL WHERE id = ?',
      [userId]
    )
  }
}

export default User
