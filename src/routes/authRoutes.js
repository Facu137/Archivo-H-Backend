// src/routes/authRoutes.js
import { Router } from 'express'
import authController from '../controllers/authController.js'
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js'
import User from '../models/User.js'

const router = Router()

// Routes de auth
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)

// Routes de profile
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({ user: req.user })
})

// Ejemplo de ruta protegida por rol
router.get(
  '/admin-only',
  verifyToken,
  checkRole(['administrador']),
  (req, res) => {
    res
      .status(200)
      .json({ message: 'Bienvenido al sistema de administración' })
  }
)

// Ruta protegida para empleados y administradores
router.get('/archivos-privados', verifyToken, checkRole(['empleado', 'administrador']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Aquí iría la lógica para obtener los archivos privados
    // Por ejemplo:
    const archivosPrivados = [
      { id: 1, nombre: 'Archivo confidencial 1' },
      { id: 2, nombre: 'Archivo confidencial 2' }
      // ... más archivos
    ]

    res.status(200).json({
      message: 'Acceso permitido a los archivos privados',
      archivos: archivosPrivados,
      permisos: {
        puedeDescargar: user.rol === 'administrador' || user.permiso_descargar,
        puedeEditar: user.rol === 'administrador' || user.permiso_editar,
        puedeEliminar: user.rol === 'administrador' || user.permiso_eliminar
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al acceder a los archivos privados', error: error.message })
  }
})

export default router
