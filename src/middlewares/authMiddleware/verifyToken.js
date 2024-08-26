// src\middlewares\authMiddleware\verifyToken.js
import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.refreshToken // Verificar también en las cookies

  if (!authHeader) {
    return res.status(403).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1] || authHeader // Extraer el token si está en formato Bearer o directamente como refreshToken

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    // Si el token de acceso es inválido, intentar verificar el refresh token
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      req.user = decoded
      next()
    } catch (refreshError) {
      return res.status(401).json({ message: 'Token no válido' })
    }
  }
}

export default verifyToken
