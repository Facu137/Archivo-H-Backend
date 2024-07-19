import authController from '../controllers/authController.js'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(403).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' })
  }
}

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    next()
  }
}

const checkPermission = (permission) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user || !user[permission]) {
      return res.status(403).json({ message: 'Permiso denegado' })
    }
    next()
  }
}
const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return next()
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next()
    }

    const { accessToken } = authController.generateTokens(user)

    res.setHeader('Authorization', `Bearer ${accessToken}`)
    next()
  } catch (error) {
    next()
  }
}

export { verifyToken, checkRole, checkPermission, refreshAccessToken }
