// src/models/user/findByRefreshToken.js
import db from '../../config/db.js'

const findByRefreshToken = async (refreshToken) => {
  const [results] = await db.query(
    'SELECT * FROM personas_usuarios WHERE refresh_token = ?',
    [refreshToken]
  )
  return results[0]
}

export default findByRefreshToken
