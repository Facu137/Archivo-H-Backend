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
    origin: 'http://localhost:5173', // Ajusta esto a la URL de tu frontend
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
app.get('/', (req, res) => {
  res.send(
    '<body style="background-color: black; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;"><h1>Servidor Archivo Historico funcionando... </h1>'
  )
})

// Iniciar el servidor
const startServer = async () => {
  try {
    // Verificar la conexión a la base de datos
    await testConnection()

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
