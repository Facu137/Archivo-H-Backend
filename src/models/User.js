// src/models/User.js
import create from './user/create.js'
import findByEmail from './user/findByEmail.js'
import findById from './user/findById.js'
import updateRefreshToken from './user/updateRefreshToken.js'
import findByRefreshToken from './user/findByRefreshToken.js'
import removeRefreshToken from './user/removeRefreshToken.js'
import update from './user/update.js'

const User = {
  create,
  findByEmail,
  findById,
  updateRefreshToken,
  findByRefreshToken,
  removeRefreshToken,
  update
}

export default User
