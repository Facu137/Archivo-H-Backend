// src/controllers/authController/me.js
import User from '../../models/User.js'

const me = async (req, res) => {
  try {
    // Obtener el ID del usuario del token decodificado
    const userId = req.user.id

    // Buscar al usuario en la base de datos
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Devolver la información del usuario
    return res.status(200).json({
      id: user.id,
      name: user.nombre,
      lastName: user.apellido,
      email: user.email,
      rol: user.rol
      // ... otras propiedades del usuario que quieras devolver
    })
  } catch (error) {
    console.error('Error al obtener la información del usuario:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export default me
