// src/controllers/authController/logout.js
import User from '../../models/User.js'

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return res.status(200).json({ message: 'Logout exitoso' })
  }

  try {
    // Buscar el usuario por el refreshToken para obtener el userId
    const user = await User.findByRefreshToken(refreshToken)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Eliminar el refreshToken del usuario
    await User.removeRefreshToken(user.id)

    res.clearCookie('refreshToken')
    return res.status(200).json({ message: 'Logout exitoso' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error al cerrar sesión', error: error.message })
  }
}

export default logout
