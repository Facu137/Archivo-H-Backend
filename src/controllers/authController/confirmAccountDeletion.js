// src\controllers\authController\confirmAccountDeletion.js
import User from '../../models/User.js'
import jwt from 'jsonwebtoken'

const confirmAccountDeletion = async (req, res) => {
  try {
    // Obtener el token de la query o del body
    const token = req.query.token || req.body.token

    if (!token) {
      return res.status(400).json({ message: 'Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_DELETION_SECRET)
    const user = await User.findByEmail(decoded.email)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    switch (user.rol) {
      case 'usuario':
        await User.deleteUser(user.id)
        break
      case 'administrador':
        {
          const admin = await User.findAdminById(user.id)
          if (admin && admin.sucesor) {
            const successor = await User.findEmployeeById(admin.sucesor)
            if (successor && successor.activo) {
              await User.promoteEmployeeToAdmin(successor.persona_id)
              await User.deleteUser(user.id)
            } else {
              return res
                .status(400)
                .json({ message: 'El sucesor designado ya no está activo' })
            }
          } else {
            return res.status(400).json({
              message: 'No se puede dar de baja sin un sucesor designado'
            })
          }
        }

        break
      case 'empleado':
        {
          const employee = await User.findEmployeeById(user.id)
          if (employee && !employee.activo) {
            await User.deleteUser(user.id)
          } else {
            return res
              .status(400)
              .json({ message: 'No se puede dar de baja a un empleado activo' })
          }
        }

        break
    }

    // Redirigir al usuario a la página de inicio de sesión con el parámetro accountDeleted=true
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?accountDeleted=true&logout=true`
    )
  } catch (error) {
    console.error('Error al confirmar la baja de cuenta:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Token inválido' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'El token ha expirado' })
    }
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export default confirmAccountDeletion
