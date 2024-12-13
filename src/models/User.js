// src/models/User.js
import create from './user/create.js'
import findByEmail from './user/findByEmail.js'
import findById from './user/findById.js'
import updateRefreshToken from './user/updateRefreshToken.js'
import findByRefreshToken from './user/findByRefreshToken.js'
import removeRefreshToken from './user/removeRefreshToken.js'
import update from './user/update.js'
import findAdminById from './user/findAdminById.js'
import findEmployeeById from './user/findEmployeeById.js'
import deleteUser from './user/deleteUser.js'
import promoteEmployeeToAdmin from './user/promoteEmployeeToAdmin.js'

const User = {
  create,
  findByEmail,
  findById,
  updateRefreshToken,
  findByRefreshToken,
  removeRefreshToken,
  update,
  findAdminById,
  findEmployeeById,
  deleteUser,
  promoteEmployeeToAdmin
}

export default User
