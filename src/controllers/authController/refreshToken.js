// src\controllers\authController\refreshToken.js
import jwt from 'jsonwebtoken'
import User from '../../models/User.js'
import generateTokens from './generateTokens.js'

const refreshToken = async (req, res) => {
  // Cambiado de refreshAccessToken a refreshToken
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token no proporcionado' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(403).json({ message: 'Refresh token inválido' })
    }

    // Generar nuevos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

    // Actualizar el refreshToken en la base de datos
    await User.updateRefreshToken(user.id, newRefreshToken)

    // Establecer el nuevo refreshToken en las cookies
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    // Enviar el nuevo accessToken en la respuesta
    return res.status(200).json({ accessToken })
  } catch (error) {
    // Eliminar la cookie refreshToken si es inválida
    res.clearCookie('refreshToken')
    return res.status(403).json({ message: 'Refresh token inválido' })
  }
}

export default refreshToken
