// src/app.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { testConnection } from './config/db.js'

config() // Cargar variables de entorno

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.VITE_FRONTEND_URL
        : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(express.json())
app.use(cookieParser())

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Rutas de autenticación (sin prefijo /api)
app.use('/auth', authRoutes)

// Rutas de admin (sin prefijo /api)
app.use('/admin', adminRoutes)

// Resto de rutas con prefijo /api
app.use('/api', routes)

// Ruta principal
app.get('/', async (req, res) => {
  let dbStatus = 'Desconectada '
  try {
    await testConnection()
    dbStatus = 'Conectada '
  } catch (error) {
    console.error('Error al verificar la base de datos:', error)
  }

  res.send(`
    <body style="background-color: black; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
      <h1>Servidor Archivo Histrico funcionando... </h1>
      <h2>Base de datos: ${dbStatus}</h2>
    </body>
  `)
})

// Iniciar el servidor
const startServer = async () => {
  try {
    // Verificar la conexión a la base de datos
    await testConnection()

    app.listen(port, () => {
      console.log(` Server running on port ${port}`)
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`)
      console.log(`Backend URL: ${process.env.BACKEND_URL}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
