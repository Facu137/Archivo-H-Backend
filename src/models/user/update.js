// src/models/user/update.js
import db from '../../config/db.js'

const update = async (userId, userData) => {
  if (typeof userId !== 'number') {
    throw new Error('El ID de usuario debe ser un número')
  }

  if (typeof userData !== 'object' || userData === null) {
    throw new Error('Los datos del usuario deben ser un objeto')
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    let query = 'UPDATE personas_usuarios SET '
    const params = []

    if (userData.email !== undefined) {
      query += 'email = ?, '
      params.push(userData.email)
    }

    if (userData.nombre !== undefined) {
      query += 'nombre = ?, '
      params.push(userData.nombre)
    }

    if (userData.apellido !== undefined) {
      query += 'apellido = ?, '
      params.push(userData.apellido)
    }

    if (userData.contrasena !== undefined) {
      query += 'contrasena = ?, '
      params.push(userData.contrasena)
    }

    if (userData.email_verified !== undefined) {
      query += 'email_verified = ?, '
      params.push(userData.email_verified)
    }

    // Eliminar la última coma y espacio si hay campos para actualizar
    if (params.length > 0) {
      query = query.slice(0, -2)
    } else {
      throw new Error('No se proporcionaron campos para actualizar')
    }

    query += ' WHERE id = ?'
    params.push(userId)

    const [result] = await connection.query(query, params)

    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default update
