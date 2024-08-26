// src/controllers/authController/editUser.js
import { hash } from 'bcrypt'
import User from '../../models/User.js'
import { updateUserSchema } from '../../schemas/authSchema.js'

const editUser = async (req, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body)
    const { email, password, nombre, apellido } = validatedData

    const userId = req.user.id // Asumiendo que el usuario está autenticado y su ID está en req.user

    const userData = {
      email,
      nombre,
      apellido
    }

    if (password !== undefined) {
      userData.password = await hash(password, 10)
    }

    await User.update(userId, userData)
    res.status(200).json({ message: 'Usuario actualizado con éxito' })
  } catch (error) {
    console.error('Error de validación:', error)

    if (error.issues) {
      return res
        .status(400)
        .json({ errors: error.issues.map((issue) => issue.message) })
    }
    res.status(500).json({ error: error.message })
  }
}

export default editUser
