import db from '../config/db.js'

const User = {
  create: async (user) => {
    const query =
      'INSERT INTO usuario (email, password, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)'
    const rol = 'user'
    const [result] = await db.query(query, [
      user.email,
      user.password,
      user.nombre,
      user.apellido,
      rol
    ])
    return result
  },
  findByEmail: async (email) => {
    const query = 'SELECT * FROM usuario WHERE email = ?'
    const [results] = await db.query(query, [email])
    return results
  }
}

export default User
