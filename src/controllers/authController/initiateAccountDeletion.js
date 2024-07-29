// src\controllers\authController\initiateAccountDeletion.js
import User from '../../models/User.js'
import transporter from '../../config/mail.js'
import jwt from 'jsonwebtoken'

const initiateAccountDeletion = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findByEmail(email)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    let canDelete = false
    let message = ''

    switch (user.rol) {
      case 'usuario':
        canDelete = true
        break
      case 'administrador':
        {
          const admin = await User.findAdminById(user.id)
          if (admin && admin.sucesor) {
            const successor = await User.findEmployeeById(admin.sucesor)
            if (successor && successor.activo) {
              canDelete = true
            } else {
              message =
                'No se puede dar de baja sin un sucesor designado activo'
            }
          } else {
            message = 'No se puede dar de baja sin un sucesor designado'
          }
        }
        break
      case 'empleado':
        {
          const employee = await User.findEmployeeById(user.id)
          if (employee && !employee.activo) {
            canDelete = true
          } else {
            message = 'No se puede dar de baja a un empleado activo'
          }
        }
        break
    }

    if (canDelete) {
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_ACCOUNT_DELETION_SECRET,
        { expiresIn: '1h' }
      )

      const deletionLink = `${process.env.BACKEND_URL}/auth/confirm-acc-deletion?token=${token}`

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'Confirmación de baja de cuenta',
        html: `
          <p>Haz clic en el siguiente enlace para confirmar la baja de tu cuenta:</p>
          <a href="${deletionLink}">Confirmar baja de cuenta</a>
          <p>Este enlace expirará en 1 hora.</p>
        `
      })

      res.status(200).json({
        message:
          'Se ha enviado un correo de confirmación para dar de baja la cuenta'
      })
    } else {
      res.status(400).json({ message })
    }
  } catch (error) {
    console.error('Error al iniciar el proceso de baja de cuenta:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export default initiateAccountDeletion
