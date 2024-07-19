import { compare } from 'bcrypt'
import User from '../../models/User.js'
import generateTokens from './generateTokens.js'
import { loginSchema } from '../../schemas/authSchema.js'

/**
 * Inicia sesión de un usuario con el correo electrónico y la contraseña proporcionados.
 *
 * @param {Object} req - El objeto de solicitud que contiene el correo electrónico y la contraseña en el cuerpo de la solicitud.
 * @param {Object} req.body - El cuerpo de la solicitud.
 * @param {string} req.body.email - El correo electrónico del usuario que intenta iniciar sesión.
 * @param {string} req.body.password - La contraseña del usuario que intenta iniciar sesión.
 * @param {Object} res - El objeto de respuesta utilizado para enviar el resultado del inicio de sesión.
 * @return {Promise<void>} - Una promesa que se resuelve cuando el inicio de sesión es exitoso o se rechaza con un mensaje de error.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta para el inicio de sesión.
 * app.post('/login', login);
 *
 * // Luego, desde el cliente, podríamos hacer una solicitud POST a esta ruta con el siguiente cuerpo:
 * const response = await fetch('/login', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     email: 'usuario@example.com',
 *     password: 'contraseña123'
 *   })
 * });
 *
 * // Si el inicio de sesión es exitoso, la respuesta tendrá un estado 200 y contendrá el token de acceso.
 * if (response.status === 200) {
 *   const data = await response.json();
 *   console.log('Token de acceso:', data.accessToken);
 * } else {
 *   const error = await response.json();
 *   console.error('Error de inicio de sesión:', error.message);
 * }
 */
const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    const { email, password } = validatedData

    const user = await User.findByEmail(email)

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }

    const passwordMatch = await compare(password, user.contrasena)

    if (passwordMatch) {
      const { accessToken, refreshToken } = generateTokens(user)

      await User.updateRefreshToken(user.id, refreshToken)

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      return res.status(200).json({ accessToken })
    } else {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default login
