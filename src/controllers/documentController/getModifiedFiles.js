// src/controllers/documentController/getModifiedFiles.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'

async function getModifiedDocuments(req, res) {
  let connection

  try {
    // Verificar si el usuario es administrador o empleado
    const user = await User.findById(req.user.id)
    if (user.rol !== 'administrador' && user.rol !== 'empleado') {
      return res.status(403).json({ message: 'Acceso denegado' })
    }

    connection = await dbConfig.getConnection()

    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 100

    // Consulta SQL para obtener documentos modificados con paginación
    const sql = `
      SELECT 
        d.id AS documento_id,
        d.tipo_documento,
        d.anio,
        d.mes,
        d.dia,
        d.caratula_asunto_extracto,
        d.tema,
        d.folios,
        ac.columna_modificada,
        ac.valor_anterior,
        ac.valor_nuevo,
        pu.nombre AS usuario_modificacion_nombre,
        pu.apellido AS usuario_modificacion_apellido,
        ac.fecha_hora AS fecha_modificacion
      FROM auditoria_cambios ac
      JOIN documentos d ON ac.id_registro_afectado = d.id
      LEFT JOIN personas_usuarios pu ON ac.usuario_id = pu.id
      WHERE ac.tabla_afectada = 'documentos'
      AND ac.columna_modificada != 'esta_eliminado'  -- Excluir cambios en la columna 'esta_eliminado'
      ORDER BY fecha_modificacion DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `

    // Ejecutar la consulta
    const [rows] = await connection.execute(sql)

    // Transformar los resultados en un formato más estructurado
    const formattedResults = rows.map((row) => ({
      documento_id: row.documento_id,
      tipo_documento: row.tipo_documento,
      fecha_documento: {
        anio: row.anio,
        mes: row.mes,
        dia: row.dia
      },
      caratula_asunto_extracto: row.caratula_asunto_extracto,
      tema: row.tema,
      folios: row.folios,
      modificacion: {
        columna: row.columna_modificada,
        valorAnterior: row.valor_anterior,
        valorNuevo: row.valor_nuevo,
        usuario: `${row.usuario_modificacion_nombre} ${row.usuario_modificacion_apellido}`,
        fecha: row.fecha_modificacion
      }
    }))

    res.status(200).json({
      results: formattedResults,
      page,
      pageSize
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener documentos modificados',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default getModifiedDocuments
