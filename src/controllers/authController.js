// src\controllers\authController.js
import register from './authController/register.js'
import login from './authController/login.js'
import refreshToken from './authController/refreshToken.js'
import logout from './authController/logout.js'
import editUser from './authController/editUser.js'
import verifyEmail from './authController/verifyEmail.js'
import forgotPassword from './authController/forgotPassword.js'
import resetPassword from './authController/resetPassword.js'
import initiateAccountDeletion from './authController/initiateAccountDeletion.js'
import confirmAccountDeletion from './authController/confirmAccountDeletion.js'
import requestEmpRole from './authController/requestEmpRole.js'

const authController = {
  register,
  login,
  refreshToken,
  logout,
  editUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  initiateAccountDeletion,
  confirmAccountDeletion,
  requestEmpRole
}

export default authController
