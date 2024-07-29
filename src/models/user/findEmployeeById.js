// src/models/user/findEmployeeById.js
import db from '../../config/db.js'

const findEmployeeById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM empleados WHERE persona_id = ?',
    [id]
  )
  return rows[0]
}

export default findEmployeeById
