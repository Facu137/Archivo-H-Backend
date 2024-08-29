// src/controllers/adminController/getSucesor.js
import db from '../../config/db.js'

const getSucesor = async (req, res) => {
  const adminId = req.params.adminId

  if (!adminId) {
    return res.status(400).json({ message: 'Falta el ID del administrador' })
  }

  const connection = await db.getConnection()
  try {
    // Obtener el sucesor del administrador y su información de empleado
    const [result] = await connection.query(
      `SELECT 
        a.sucesor as sucesorId, 
        pu.nombre AS sucesorNombre, 
        pu.apellido AS sucesorApellido,
        pu.email AS sucesorEmail,
        e.activo AS sucesorActivo,
        e.permiso_crear AS sucesorPermisoCrear,
        e.permiso_editar AS sucesorPermisoEditar,
        e.permiso_eliminar AS sucesorPermisoEliminar,
        e.permiso_descargar AS sucesorPermisoDescargar,
        e.permiso_ver_archivos_privados AS sucesorPermisoVerArchivosPrivados
      FROM administradores a
      LEFT JOIN personas_usuarios pu ON a.sucesor = pu.id
      LEFT JOIN empleados e ON a.sucesor = e.persona_id
      WHERE a.persona_id = ?`,
      [adminId]
    )

    if (result.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }

    // Si no hay sucesor, devolver un mensaje
    if (!result[0].sucesorId) {
      return res.status(200).json({ message: 'No tiene sucesor asignado.' })
    }

    // Devolver la información del sucesor, incluyendo datos de empleado
    res.status(200).json({
      sucesor: {
        id: result[0].sucesorId,
        nombre: result[0].sucesorNombre,
        apellido: result[0].sucesorApellido,
        email: result[0].sucesorEmail,
        activo: result[0].sucesorActivo,
        permisos: {
          crear: result[0].sucesorPermisoCrear,
          editar: result[0].sucesorPermisoEditar,
          eliminar: result[0].sucesorPermisoEliminar,
          descargar: result[0].sucesorPermisoDescargar,
          verArchivosPrivados: result[0].sucesorPermisoVerArchivosPrivados
        }
      }
    })
  } catch (error) {
    console.error('Error al obtener el sucesor:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default getSucesor
