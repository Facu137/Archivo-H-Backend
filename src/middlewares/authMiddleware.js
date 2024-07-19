import verifyToken from './authMiddleware/verifyToken.js'
import checkRole from './authMiddleware/checkRole.js'
import checkPermission from './authMiddleware/checkPermission.js'
import refreshAccessToken from './authMiddleware/refreshAccessToken.js'

const authMiddleware = {
  verifyToken,
  checkRole,
  checkPermission,
  refreshAccessToken
}

export { verifyToken, checkRole, checkPermission, refreshAccessToken }
export default authMiddleware
