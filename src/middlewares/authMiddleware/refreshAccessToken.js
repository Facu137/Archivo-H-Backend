import jwt from 'jsonwebtoken'
import User from '../../models/User.js'
import authController from '../../controllers/authController.js'

/**
 * Función asincrónica para refrescar el token de acceso.
 *
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función de siguiente middleware.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta que utiliza este middleware.
 * app.get('/ruta-protegida', refreshAccessToken, (req, res) => {
 *   res.status(200).json({ message: 'Acceso concedido' });
 * });
 *
 * // Luego, desde el cliente, podríamos hacer una solicitud GET a esta ruta con el token de refresco en las cookies:
 * const response = await fetch('/ruta-protegida', {
 *   method: 'GET',
 *   headers: {
 *     'Cookie': 'refreshToken=' + refreshToken
 *   }
 * });
 *
 * // Si el token de refresco es válido, la respuesta tendrá un estado 200 y un mensaje de éxito.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Acceso concedido:', data.message);
 * } else {
 *   const error = await response.json();
 *   console.error('Error de acceso:', error.message);
 * }
 */
const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return next()
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next()
    }

    const { accessToken } = authController.generateTokens(user)

    res.setHeader('Authorization', `Bearer ${accessToken}`)
    next()
  } catch (error) {
    next()
  }
}

export default refreshAccessToken
