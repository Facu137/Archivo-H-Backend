// src/models/user/findAdminById.js
import db from '../../config/db.js'

const findAdminById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM administradores WHERE persona_id = ?',
    [id]
  )
  return rows[0]
}

export default findAdminById
