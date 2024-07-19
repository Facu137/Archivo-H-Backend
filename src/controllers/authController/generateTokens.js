import jwt from 'jsonwebtoken'

const { sign } = jwt

/**
 * Genera tokens de acceso y de refresco para un usuario.
 *
 * @param {Object} user - El objeto del usuario para el cual se generan los tokens.
 * @param {string} user.id - El ID del usuario.
 * @param {string} user.rol - El rol del usuario.
 * @return {Object} Un objeto que contiene el token de acceso y el token de refresco.
 * @return {string} return.accessToken - El token de acceso que se utiliza para autenticar las solicitudes.
 * @return {string} return.refreshToken - El token de refresco que se utiliza para obtener un nuevo token de acceso cuando este expira.
 * @example
 * const user = { id: '123', rol: 'admin' };
 * const tokens = generateTokens(user);
 * console.log(tokens.accessToken); // Imprime el token de acceso
 * console.log(tokens.refreshToken); // Imprime el token de refresco
 */
const generateTokens = (user) => {
  const accessToken = sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  )
  const refreshToken = sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })
  return { accessToken, refreshToken }
}

export default generateTokens
