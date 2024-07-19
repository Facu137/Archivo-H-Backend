import db from '../../config/db.js'

const findById = async (id) => {
  const [results] = await db.query(
    `SELECT pu.*, 
      u.posible_empleado, 
      e.activo, e.permiso_crear, e.permiso_editar, e.permiso_eliminar, e.permiso_descargar, e.permiso_ver_archivos_privados,
      a.habilitar_busqueda_nuevos_empleados, a.clave_conversion
    FROM personas_usuarios pu
    LEFT JOIN usuarios u ON pu.id = u.persona_id
    LEFT JOIN empleados e ON pu.id = e.persona_id
    LEFT JOIN administradores a ON pu.id = a.persona_id
    WHERE pu.id = ?`,
    [id]
  )
  return results[0]
}

export default findById
