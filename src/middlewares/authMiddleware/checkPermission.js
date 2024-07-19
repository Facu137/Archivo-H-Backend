import User from '../../models/User.js'

/**
 * Middleware para verificar si un usuario tiene un permiso específico.
 *
 * @param {string} permission - El permiso que se desea verificar.
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @param {Function} next - La función del siguiente middleware.
 * @return {Promise<void>} - Resuelve si el usuario tiene el permiso, de lo contrario envía una respuesta 403.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta protegida que requiere el permiso 'admin'.
 * app.get('/ruta-protegida', verifyToken, checkPermission('admin'), (req, res) => {
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
 * // Si el usuario tiene el permiso 'admin', la respuesta tendrá un estado 200 y un mensaje de éxito.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Acceso concedido:', data.message);
 * } else {
 *   const error = await response.json();
 *   console.error('Error de acceso:', error.message);
 * }
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user || !user[permission]) {
      return res.status(403).json({ message: 'Permiso denegado' })
    }
    next()
  }
}

export default checkPermission
