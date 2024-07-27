// src\controllers\authController.js
import register from './authController/register.js'
import login from './authController/login.js'
import refreshToken from './authController/refreshToken.js'
import logout from './authController/logout.js'
import editUser from './authController/editUser.js'
import verifyEmail from './authController/verifyEmail.js'

const authController = {
  register,
  login,
  refreshToken,
  logout,
  editUser,
  verifyEmail
}

export default authController
