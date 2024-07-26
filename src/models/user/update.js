// src/models/user/update.js
import db from '../../config/db.js'

const update = async (userId, userData) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    let query =
      'UPDATE personas_usuarios SET email = ?, nombre = ?, apellido = ?'
    const params = [userData.email, userData.nombre, userData.apellido, userId]

    if (userData.password) {
      query += ', contrasena = ?'
      params.splice(3, 0, userData.password)
    }

    query += ' WHERE id = ?'

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
