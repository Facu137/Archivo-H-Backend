// controllers/authController.js
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import authSchema from '../schemas/authSchema.js'

const { sign } = jwt

const generateTokens = (user) => {
  const accessToken = sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' } // Cambiado a 1 hora
  )
  const refreshToken = sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Mantenemos 7 días para el refresh token
  )
  return { accessToken, refreshToken }
}

const register = async (req, res) => {
  try {
    // Validar los datos de entrada con Zod
    const validatedData = authSchema.parse(req.body)

    const { email, password, nombre, apellido, rol } = validatedData

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario ya existe' })
    }

    const hashedPassword = await hash(password, 10)
    const user = {
      email,
      password: hashedPassword,
      nombre,
      apellido,
      rol: rol || 'usuario'
    }

    await User.create(user)
    res.status(201).json({ message: 'Registrado con éxito con rol: ' + rol })
  } catch (error) {
    if (error.issues) {
      // Si el error es de validación de Zod, responder con los mensajes de error
      return res
        .status(400)
        .json({ errors: error.issues.map((issue) => issue.message) })
    }
    res.status(500).json({ error: error.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findByEmail(email)

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }

    const passwordMatch = await compare(password, user.contrasena)

    if (passwordMatch) {
      const { accessToken, refreshToken } = generateTokens(user)

      // Guardar refresh token en la base de datos
      await User.updateRefreshToken(user.id, refreshToken)

      // Configurar cookie HTTP-only para el refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      })

      return res.status(200).json({ accessToken })
    } else {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token no proporcionado' })
  }

  try {
    const user = await User.findByRefreshToken(refreshToken)

    if (!user) {
      return res.status(403).json({ message: 'Refresh token inválido' })
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

    // Actualizar refresh token en la base de datos
    await User.updateRefreshToken(user.id, newRefreshToken)

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    return res.status(200).json({ accessToken })
  } catch (error) {
    return res.status(403).json({ message: 'Refresh token inválido' })
  }
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return res.status(200).json({ message: 'Logout exitoso' })
  }

  try {
    // Eliminamos la verificación del token ya que no estamos usando 'decoded'
    await User.removeRefreshToken(refreshToken)

    res.clearCookie('refreshToken')
    return res.status(200).json({ message: 'Logout exitoso' })
  } catch (error) {
    return res.status(200).json({ message: 'Logout exitoso' })
  }
}

export default {
  register,
  login,
  refreshToken,
  logout
}
