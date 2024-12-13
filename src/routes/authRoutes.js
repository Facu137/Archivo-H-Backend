// src/routes/authRoutes.js
import { Router } from 'express'
import authController from '../controllers/authController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = Router()

// Routes de auth
router.post('/register', authController.register) // registrar
router.get('/verify-email', authController.verifyEmail) // verificar correo
router.post('/login', authController.login) // iniciar sesión
router.post('/refresh-token', authController.refreshToken) // refrescar token
router.post('/logout', authController.logout) // cerrar sesión
router.get('/me', verifyToken, authController.me) // informacion del usuario
router.put('/edit-user', verifyToken, authController.editUser) // editar usuario
router.post('/forgot-password', authController.forgotPassword) // solicitar restablecer contraseña
router.post('/reset-password', authController.resetPassword) // confirmar restablecer contraseña
router.post('/init-acc-deletion', authController.initiateAccountDeletion) // solicitar borrar cuenta
router.get('/confirm-acc-deletion', authController.confirmAccountDeletion) // confirmar borrar cuenta
router.post('/request-emp-role', verifyToken, authController.requestEmpRole) // solicitar rol de empleado

export default router
