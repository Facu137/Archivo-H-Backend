// src/config/db.js
import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'

config()

const pool = createPool({
  host: process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'archivotest',
  // otras opciones de configuración
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
})

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connection established successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message)
    throw error
  }
}

export default pool
