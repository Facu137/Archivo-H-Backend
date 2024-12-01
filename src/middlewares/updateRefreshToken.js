// src/middlewares/updateRefreshToken.js
import User from '../models/User.js'
import generateTokens from '../controllers/authController/generateTokens.js'
import jwt from 'jsonwebtoken'

const updateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    // Si no hay refresh token, continuar sin actualizar
    if (!refreshToken) {
      return next()
    }

    // Verificar y decodificar el token actual
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next()
    }

    // Generar nuevos tokens
    const { refreshToken: newRefreshToken } = generateTokens(user)

    // Actualizar el refreshToken en la base de datos
    await User.updateRefreshToken(user.id, newRefreshToken)

    // Actualizar la cookie con el nuevo refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    next()
  } catch (error) {
    // Si hay algún error, continuar sin actualizar el token
    next()
  }
}

export default updateRefreshToken
