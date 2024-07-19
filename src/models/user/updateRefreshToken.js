import db from '../../config/db.js'

const updateRefreshToken = async (userId, refreshToken) => {
  await db.query(
    'UPDATE personas_usuarios SET refresh_token = ? WHERE id = ?',
    [refreshToken, userId]
  )
}

export default updateRefreshToken
