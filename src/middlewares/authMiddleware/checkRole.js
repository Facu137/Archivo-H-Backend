// src\middlewares\authMiddleware\checkRole.js
/**
 * Función que verifica si el rol del usuario tiene acceso.
 *
 * @param {Array} roles - Lista de roles permitidos.
 * @return {Function} Middleware que comprueba el rol del usuario.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta protegida que requiere el rol 'admin'.
 * app.get('/ruta-protegida', verifyToken, checkRole(['admin']), (req, res) => {
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
 * // Si el usuario tiene el rol 'admin', la respuesta tendrá un estado 200 y un mensaje de éxito.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Acceso concedido:', data.message);
 * } else {
 *   const error = await response.json();
 *   console.error('Error de acceso:', error.message);
 * }
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado, no tienes el rol requerido' })
    }
    next()
  }
}

export default checkRole
