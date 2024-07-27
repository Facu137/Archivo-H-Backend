// src\controllers\authController\resetPassword.js
import jwt from 'jsonwebtoken'
import { hash } from 'bcrypt'
import User from '../../models/User.js'
import { resetPasswordSchema } from '../../schemas/authSchema.js'

const resetPassword = async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const hashedPassword = await hash(password, 10)
    await User.update(userId, { contrasena: hashedPassword })

    res.status(200).json({ message: 'Contraseña restablecida con éxito' })
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Token inválido' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expirado' })
    }
    if (error.issues) {
      return res.status(400).json({
        message: error.issues.map((issue) => issue.message).join(', ')
      })
    }
    res.status(500).json({ error: error.message })
  }
}

export default resetPassword
