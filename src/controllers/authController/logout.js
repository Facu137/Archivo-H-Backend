// src\controllers\authController\logout.js
import User from '../../models/User.js'

/**
 * Cierra la sesión del usuario eliminando el token de refresco y limpiando la cookie.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @return {Promise<Object>} Una promesa que se resuelve con el objeto de respuesta.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta para cerrar sesión.
 * app.post('/logout', logout);
 *
 * // Luego, desde el cliente, podríamos hacer una solicitud POST a esta ruta para cerrar sesión:
 * const response = await fetch('/logout', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 *
 * // Si el cierre de sesión es exitoso, la respuesta tendrá un estado 200 y un mensaje de éxito.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Cierre de sesión exitoso:', data.message);
 * } else {
 *   console.error('Error al cerrar sesión');
 * }
 */
const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return res.status(200).json({ message: 'Logout exitoso' })
  }

  try {
    await User.removeRefreshToken(refreshToken)

    res.clearCookie('refreshToken')
    return res.status(200).json({ message: 'Logout exitoso' })
  } catch (error) {
    return res.status(200).json({ message: 'Logout exitoso' })
  }
}

export default logout
