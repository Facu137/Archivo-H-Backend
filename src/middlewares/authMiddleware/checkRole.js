// src\middlewares\authMiddleware\checkRole.js
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ message: 'Acceso denegado, no tienes el rol requerido' })
    }
    next()
  }
}

// Nuevo middleware específico para administradores y empleados
export const checkAdminOrEmployeeRole = (req, res, next) => {
  const allowedRoles = ['administrador', 'empleado']
  if (!allowedRoles.includes(req.user.rol)) {
    return res.status(403).json({
      message: 'Acceso denegado, se requiere rol de administrador o empleado'
    })
  }
  next()
}

export default checkRole
