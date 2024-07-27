// src/controllers/authController/verifyEmail.js
import jwt from 'jsonwebtoken'
import User from '../../models/User.js'

const verifyEmail = async (req, res) => {
  try {
    let { token } = req.query
    console.log('Token recibido (codificado):', token)

    // Decodificar el token
    token = decodeURIComponent(token)

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=user_not_found`
      )
    }

    if (user.email_verified) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=already_verified`
      )
    }

    await User.update(userId, { email_verified: true })

    // Redirigir al frontend con un parámetro de consulta
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`)
  } catch (error) {
    console.error('Error al verificar el correo electrónico:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_token`
      )
    }
    if (error.name === 'TokenExpiredError') {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=token_expired`
      )
    }
    res.status(500).json({ error: error.message })
  }
}

export default verifyEmail
