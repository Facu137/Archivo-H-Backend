// src/config/db.js
import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
import path from 'path'

// Cargar el archivo de entorno correcto según NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
config({ path: path.resolve(process.cwd(), envFile) })

const pool = createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
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
