// src/app.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import { refreshAccessToken } from './middlewares/authMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import generalRoutes from './routes/general.js'
import advancedRoutes from './routes/advancedRoutes.js'
config() // Cargar variables de entorno

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
) /* Permite que el front-end y el back-end puedan interactuar.
CORS es un mecanismo que permite que un sitio web acceda a recursos de otro sitio web. */
app.use(express.json()) // Permite analizar solicitudes JSON como el body de la petición
app.use(cookieParser()) // Permite procesar cookies
app.use(refreshAccessToken) // refrescar token cada vez que se hace una petición

// Rutas
app.use('/auth', authRoutes) // Ruta para autenticación
app.use('/api', fileRoutes) // Ruta para subir archivos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))) // Ruta para archivos
app.use('/api', generalRoutes)
app.use('/api/documents', advancedRoutes)

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})

app.get('/', (req, res) => {
  res.send(
    '<body style="background-color: black; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;"><h1>Servidor Archivo Historico funcionando... </h1>'
  )
})
