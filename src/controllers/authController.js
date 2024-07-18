import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
const { sign } = jwt

const register = async (req, res) => {
  const { email, password, nombre, apellido } = req.body

  try {
    const hashedPassword = await hash(password, 10)
    const user = {
      email,
      password: hashedPassword,
      nombre,
      apellido,
    }

    await User.create(user)
    res.status(201).json({ message: 'Usuario registrado con éxito' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const results = await User.findByEmail(email)

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }

    const user = results[0]
    const passwordMatch = await compare(password, user.password)

    if (passwordMatch) {
      const token = sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )
      return res.status(200).json({ token })
    } else {
      return res
        .status(401)
        .json({ message: 'Correo o contraseña incorrectos' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default {
  register,
  login,
}
