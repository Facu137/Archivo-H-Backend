// src/controllers/authController/login.js
import { compare } from 'bcrypt'
import User from '../../models/User.js'
import generateTokens from './generateTokens.js'
import { loginSchema } from '../../schemas/authSchema.js'

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    const { email, password } = validatedData

    const user = await User.findByEmail(email)

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }

    // Verificar si el correo electrónico está verificado
    if (!user.email_verified) {
      return res.status(403).json({
        message:
          'Por favor, verifica tu correo electrónico antes de iniciar sesión'
      })
    }

    const passwordMatch = compare(password, user.contrasena)

    if (passwordMatch) {
      const { accessToken, refreshToken } = generateTokens(user)

      await User.updateRefreshToken(user.id, refreshToken)

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // solo accesible en el servidor
        secure: process.env.NODE_ENV === 'production', // solo accesible en https
        sameSite: 'strict', // solo accesible desde el mismo dominio
        maxAge: 7 * 24 * 60 * 60 * 1000 // la cookie expira en 7 días
      })

      // Enviar la información del usuario junto con el token de acceso
      return res.status(200).json({
        accessToken,
        user: {
          id: user.id,
          name: user.nombre,
          lastName: user.apellido,
          email: user.email,
          rol: user.rol
        }
      })
    } else {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }
  } catch (err) {
    if (err.issues) {
      return res
        .status(400)
        .json({ errors: err.issues.map((issue) => issue.message) })
    }
    res.status(500).json({ error: err.message })
  }
}

export default login
