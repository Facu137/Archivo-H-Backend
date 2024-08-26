// src/controllers/authController/forgotPassword.js
import User from '../../models/User.js'
import transporter from '../../config/mail.js'
import jwt from 'jsonwebtoken'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Generar token de recuperación de contraseña
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })

    // Codificar el token para su uso seguro en URL
    const encodedToken = encodeURIComponent(token)

    // Leer la plantilla HTML para el correo de recuperación de contraseña
    const emailTemplatePath = join(
      __dirname,
      '../../templates/forgotPasswordEmail.html'
    )
    let emailTemplate = await fs.readFile(emailTemplatePath, 'utf8')

    // Reemplazar el token en la plantilla
    emailTemplate = emailTemplate.replace(/\{encodedToken\}/g, encodedToken)

    // Enviar correo de recuperación de contraseña
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject:
        'Recuperación de Contraseña - Archivo Histórico de Santiago del Estero',
      html: emailTemplate
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({
      message: 'Correo de recuperación de contraseña enviado con éxito'
    })
  } catch (error) {
    console.error(
      'Error al enviar el correo de recuperación de contraseña:',
      error
    )
    res.status(500).json({ error: error.message })
  }
}

export default forgotPassword
