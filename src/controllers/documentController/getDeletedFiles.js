// src/controllers/documentController/getDeletedFiles.js
import dbConfig from '../../config/db.js'

async function getDeletedDocuments(req, res) {
  let connection

  try {
    connection = await dbConfig.getConnection()

    // Consulta SQL para obtener documentos eliminados
    const sql = `
      SELECT DISTINCT
  d.id AS documento_id,
  d.tipo_documento,
  d.anio,
  d.mes,
  d.dia,
  d.caratula_asunto_extracto,
  d.tema,
  d.folios,
  d.fecha_marcado_eliminacion,
  GROUP_CONCAT(DISTINCT CONCAT(dp.rol, ':', pa.nombre, ' (', pa.tipo, ')') SEPARATOR '; ') AS personas,
  GROUP_CONCAT(DISTINCT dep.nombre SEPARATOR ', ') AS departamentos,
  GROUP_CONCAT(DISTINCT i.url SEPARATOR ', ') AS imagenes_url,
  l.numero AS legajo_numero,
  e.numero AS expediente_numero,
  m.lugar AS mensura_lugar,
  m.propiedad AS mensura_propiedad,
  n.registro AS notarial_registro,
  n.protocolo AS notarial_protocolo,
  n.mes_inicio AS notarial_mes_inicio,
  n.mes_fin AS notarial_mes_fin,
  n.escritura_nro AS notarial_escritura_nro,
  n.negocio_juridico AS notarial_negocio_juridico,
  pu.nombre AS usuario_eliminacion_nombre,
  pu.apellido AS usuario_eliminacion_apellido,
  ac.fecha_hora AS fecha_eliminacion
FROM
  auditoria_cambios ac
JOIN documentos d ON ac.id_registro_afectado = d.id
LEFT JOIN documentos_departamentos dd ON d.id = dd.documento_id
LEFT JOIN departamentos dep ON dd.departamento_id = dep.id
LEFT JOIN documentos_personas dp ON d.id = dp.documento_id
LEFT JOIN personas_archivo pa ON dp.persona_id = pa.id
LEFT JOIN imagenes i ON d.id = i.documento_id
LEFT JOIN expedientes e ON d.expediente_id = e.id
LEFT JOIN legajos l ON e.legajo_id = l.id
LEFT JOIN mensura m ON d.id = m.id
LEFT JOIN notarial n ON d.id = n.id
LEFT JOIN personas_usuarios pu ON ac.usuario_id = pu.id
WHERE
  ac.tabla_afectada = 'documentos'
  AND ac.columna_modificada = 'esta_eliminado'
  AND ac.valor_nuevo = '1'
  AND d.esta_eliminado = 1
  AND d.fecha_marcado_eliminacion IS NOT NULL
  AND DATEDIFF(CURDATE(), d.fecha_marcado_eliminacion) <= 180
GROUP BY 
  d.id, 
  pu.nombre, 
  pu.apellido 
ORDER BY ac.fecha_hora DESC;
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
      fecha_marcado_eliminacion: row.fecha_marcado_eliminacion,
      personas: row.personas
        ? row.personas.split('; ').map((p) => {
            const [rol, resto] = p.split(':')
            const [nombre, tipo] = resto.split(' (')
            return { rol, nombre, tipo: tipo.slice(0, -1) }
          })
        : [],
      departamentos: row.departamentos ? row.departamentos.split(', ') : [],
      imagenes_url: row.imagenes_url ? row.imagenes_url.split(', ') : [],
      legajo: {
        numero: row.legajo_numero
      },
      expediente: {
        numero: row.expediente_numero
      },
      mensura:
        row.mensura_lugar || row.mensura_propiedad
          ? {
              lugar: row.mensura_lugar,
              propiedad: row.mensura_propiedad
            }
          : null,
      notarial: row.notarial_registro
        ? {
            registro: row.notarial_registro,
            protocolo: row.notarial_protocolo,
            mes_inicio: row.notarial_mes_inicio,
            mes_fin: row.notarial_mes_fin,
            escritura_nro: row.notarial_escritura_nro,
            negocio_juridico: row.notarial_negocio_juridico
          }
        : null,
      eliminacion: {
        usuario: `${row.usuario_eliminacion_nombre} ${row.usuario_eliminacion_apellido}`,
        fecha: row.fecha_eliminacion
      }
    }))

    res.status(200).json(formattedResults)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener documentos eliminados',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default getDeletedDocuments
