// src\middlewares\authMiddleware\checkPermission.js
import User from '../../models/User.js'
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user || !user[permission]) {
      return res.status(403).json({
        message:
          'Permiso denegado, no tienes el permiso para acceder a esta ruta'
      })
    }
    next()
  }
}

export default checkPermission
