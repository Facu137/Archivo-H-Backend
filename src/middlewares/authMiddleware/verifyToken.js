// src\middlewares\authMiddleware\verifyToken.js
import jwt from 'jsonwebtoken'

/**
 * Verifica el token en los encabezados de la solicitud y establece la información del usuario decodificada en el objeto de solicitud.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @param {Function} next - La función del siguiente middleware.
 * @return {Object|void} Retorna el objeto de respuesta con un estado 403 y un mensaje de error si el token no está proporcionado.
 *                       Retorna el objeto de respuesta con un estado 401 y un mensaje de error si el token es inválido.
 *                       Llama a la función del siguiente middleware si el token es válido.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta protegida que requiere un token válido.
 * app.get('/ruta-protegida', verifyToken, (req, res) => {
 *   res.status(200).json({ message: 'Acceso concedido' });
 * });
 *
 * // Luego, desde el cliente, podríamos hacer una solicitud GET a esta ruta con el token de acceso en el encabezado:
 * const response = await fetch('/ruta-protegida', {
 *   method: 'GET',
 *   headers: {
 *     'Authorization': 'Bearer ' + accessToken
 *   }
 * });
 *
 * // Si el token es válido, la respuesta tendrá un estado 200 y un mensaje de éxito.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Acceso concedido:', data.message);
 * } else {
 *   const error = await response.json();
 *   console.error('Error de acceso:', error.message);
 * }
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(403).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' })
  }
}

export default verifyToken
