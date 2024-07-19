// src\controllers\authController.js
import register from './authController/register.js'
import login from './authController/login.js'
import refreshToken from './authController/refreshToken.js'
import logout from './authController/logout.js'

const authController = {
  register,
  login,
  refreshToken,
  logout
}

export default authController
