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

export default checkRole
