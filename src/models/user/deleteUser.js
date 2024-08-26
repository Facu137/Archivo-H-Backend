// src/models/user/deleteUser.js
import db from '../../config/db.js'

const deleteUser = async (id) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    await connection.query('DELETE FROM usuarios WHERE persona_id = ?', [id])
    await connection.query('DELETE FROM empleados WHERE persona_id = ?', [id])
    await connection.query('DELETE FROM administradores WHERE persona_id = ?', [
      id
    ])
    await connection.query('DELETE FROM personas_usuarios WHERE id = ?', [id])

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default deleteUser
