// src\controllers\authController\generateTokens.js
import jwt from 'jsonwebtoken'

const { sign } = jwt

const generateTokens = (user) => {
  const accessToken = sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  )
  const refreshToken = sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })
  return { accessToken, refreshToken }
}

export default generateTokens
