import User from '../../models/User.js'
import generateTokens from './generateTokens.js'

/**
 * Refresca el token de acceso utilizando el token de refresco proporcionado en las cookies de la solicitud.
 *
 * @param {Object} req - El objeto de solicitud que contiene el token de refresco en las cookies.
 * @param {Object} res - El objeto de respuesta para enviar el token de acceso actualizado y el nuevo token de refresco.
 * @return {Promise<Object>} Retorna una promesa que se resuelve con un objeto JSON que contiene el token de acceso actualizado.
 * @throws {Object} Retorna un objeto JSON con un mensaje de error si el token de refresco no es proporcionado o es inválido.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta para refrescar el token.
 * app.post('/refresh-token', refreshToken);
 *
 * // Luego, desde el cliente, podríamos hacer una solicitud POST a esta ruta para refrescar el token:
 * const response = await fetch('/refresh-token', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 *
 * // Si el token de refresco es válido, la respuesta tendrá un estado 200 y contendrá el nuevo token de acceso.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Nuevo token de acceso:', data.accessToken);
 * } else {
 *   const error = await response.json();
 *   console.error('Error al refrescar el token:', error.message);
 * }
 */
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

    await User.updateRefreshToken(user.id, newRefreshToken)

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({ accessToken })
  } catch (error) {
    return res.status(403).json({ message: 'Refresh token inválido' })
  }
}

export default refreshToken
