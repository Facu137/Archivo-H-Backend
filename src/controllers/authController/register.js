import { hash } from 'bcrypt'
import User from '../../models/User.js'
import { registerSchema } from '../../schemas/authSchema.js'

/**
 * Función asincrónica para registrar un nuevo usuario.
 *
 * @param {Object} req - Objeto de solicitud que contiene los datos del usuario a registrar en el cuerpo de la solicitud.
 * @param {Object} req.body - Cuerpo de la solicitud que incluye los datos del usuario: email, password, nombre, apellido y rol.
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {string} req.body.password - Contraseña del usuario.
 * @param {string} req.body.nombre - Nombre del usuario.
 * @param {string} req.body.apellido - Apellido del usuario.
 * @param {string} [req.body.rol='usuario'] - Rol del usuario (opcional, por defecto es 'usuario').
 * @param {Object} res - Objeto de respuesta utilizado para enviar el resultado del registro.
 * @return {Promise<void>} - Una promesa que se resuelve cuando el usuario es registrado con éxito o se rechaza con un mensaje de error.
 *
 * @example
 * // Supongamos que tenemos un servidor Express configurado y una ruta para el registro de usuarios.
 * app.post('/register', register);
 *
 * // Luego, desde el cliente, podríamos hacer una solicitud POST a esta ruta con el siguiente cuerpo:
 * const response = await fetch('/register', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     email: 'usuario@example.com',
 *     password: 'contraseña123',
 *     nombre: 'Nombre',
 *     apellido: 'Apellido',
 *     rol: 'usuario'
 *   })
 * });
 *
 * // Si el registro es exitoso, la respuesta tendrá un estado 201 y un mensaje de éxito.
 * if (response.status === 201) {
 *   const data = await response.json();
 *   console.log('Registro exitoso:', data.message);
 * } else {
 *   const error = await response.json();
 *   console.error('Error en el registro:', error.message);
 * }
 */
const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    const { email, password, nombre, apellido, rol } = validatedData

    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario ya existe' })
    }

    const hashedPassword = await hash(password, 10)
    const user = {
      email,
      password: hashedPassword,
      nombre,
      apellido,
      rol: rol || 'usuario'
    }

    await User.create(user)
    res.status(201).json({ message: 'Registrado con éxito con rol: ' + rol })
  } catch (error) {
    if (error.issues) {
      return res
        .status(400)
        .json({ errors: error.issues.map((issue) => issue.message) })
    }
    res.status(500).json({ error: error.message })
  }
}

export default register
