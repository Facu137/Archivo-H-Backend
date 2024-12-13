// src/controllers/adminController/listEmployees.js
import db from '../../config/db.js'

const listEmployees = async (req, res) => {
  const connection = await db.getConnection()
  try {
    const [results] = await connection.query(
      `SELECT pu.id, pu.nombre, pu.apellido, pu.email, pu.rol,
              e.activo, e.permiso_crear, e.permiso_editar, 
              e.permiso_eliminar, e.permiso_descargar, 
              e.permiso_ver_archivos_privados
       FROM personas_usuarios pu
       JOIN empleados e ON pu.id = e.persona_id
       WHERE pu.rol = 'empleado'`
    )
    res.status(200).json(results)
  } catch (error) {
    console.error('Error al listar empleados:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default listEmployees
