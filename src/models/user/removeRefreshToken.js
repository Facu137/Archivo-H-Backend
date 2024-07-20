// src/models/user/removeRefreshToken.js
import db from '../../config/db.js'

const removeRefreshToken = async (userId) => {
  await db.query(
    'UPDATE personas_usuarios SET refresh_token = NULL WHERE id = ?',
    [userId]
  )
}

export default removeRefreshToken
