// src\middlewares\authMiddleware.js
import verifyToken from './authMiddleware/verifyToken.js'
import checkRole from './authMiddleware/checkRole.js'
import checkPermission from './authMiddleware/checkPermission.js'

const authMiddleware = {
  verifyToken,
  checkRole,
  checkPermission
}

export { verifyToken, checkRole, checkPermission }
export default authMiddleware
