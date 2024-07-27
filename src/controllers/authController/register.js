// src/controllers/authController/register.js
import { hash } from 'bcrypt'
import User from '../../models/User.js'
import { registerSchema } from '../../schemas/authSchema.js'
import transporter from '../../config/mail.js'
import jwt from 'jsonwebtoken'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

    const result = await User.create(user)
    const userId = result.insertId

    // Generar token de verificación según el id del usuario
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    // Codificar el token para su uso seguro en URL
    const encodedToken = encodeURIComponent(token)

    // Leer la plantilla HTML
    const emailTemplatePath = join(
      __dirname,
      '../../templates/verificationEmail.html'
    )
    let emailTemplate = await fs.readFile(emailTemplatePath, 'utf8')

    // Reemplazar el token en la plantilla
    emailTemplate = emailTemplate.replace(/\{encodedToken\}/g, encodedToken)

    // Enviar correo de verificación
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject:
        'Verificación de Correo Electrónico - Archivo Histórico de Santiago del Estero',
      html: emailTemplate
    }

    await transporter.sendMail(mailOptions)

    res.status(201).json({
      message:
        'Registrado con éxito. Por favor, verifica tu correo electrónico.'
    })
  } catch (error) {
    console.error('Error de validación:', error)

    if (error.issues) {
      return res
        .status(400)
        .json({ errors: error.issues.map((issue) => issue.message) })
    }
    res.status(500).json({ error: error.message })
  }
}

export default register
