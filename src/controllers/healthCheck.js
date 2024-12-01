// src/controllers/healthCheck.js
import pool from '../config/db.js'

const healthCheck = async (req, res) => {
  try {
    // Verificar la conexión a la base de datos
    const [result] = await pool.query('SELECT 1')
    const dbStatus = result ? 'connected' : 'disconnected'

    // Obtener información del sistema
    const healthStatus = {
      status: 'ok',
      timestamp: new Date(),
      service: 'Archivo-H-Backend',
      database: {
        status: dbStatus,
        type: 'MySQL'
      },
      uptime: process.uptime(), // Tiempo de actividad del servidor en segundos
      memory: process.memoryUsage(), // Uso de memoria
      environment: process.env.NODE_ENV || 'development'
    }

    res.status(200).json(healthStatus)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      error: error.message,
      database: {
        status: 'disconnected',
        type: 'MySQL'
      }
    })
  }
}

export default healthCheck
