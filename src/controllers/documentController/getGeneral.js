// src/controllers/documentController/getGeneral.js
import dbConfig from '../../config/db.js'

async function getGeneral(req, res) {
  const searchTerm = req.query.search

  if (!searchTerm) {
    return res.status(400).json({ message: 'Término de búsqueda requerido' })
  }

  let connection

  try {
    connection = await dbConfig.getConnection()

    // Consulta SQL con JOIN para las tablas especificadas
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
        dp.rol AS persona_rol,
        pa.nombre AS persona_nombre,
        pa.tipo AS persona_tipo,
        dep.nombre AS departamento_nombre,
        i.url AS imagen_url,
        l.numero AS legajo_numero,
        e.numero AS expediente_numero,
        m.lugar AS mensura_lugar,
        m.propiedad AS mensura_propiedad,
        n.registro AS notarial_registro,
        n.protocolo AS notarial_protocolo
      FROM documentos AS d
      LEFT JOIN documentos_departamentos AS dd ON d.id = dd.documento_id
      LEFT JOIN departamentos AS dep ON dd.departamento_id = dep.id
      LEFT JOIN documentos_personas AS dp ON d.id = dp.documento_id
      LEFT JOIN personas_archivo AS pa ON dp.persona_id = pa.id
      LEFT JOIN imagenes AS i ON d.id = i.documento_id
      LEFT JOIN expedientes AS e ON d.expediente_id = e.id
      LEFT JOIN legajos AS l ON e.legajo_id = l.id
      LEFT JOIN mensura AS m ON d.id = m.id
      LEFT JOIN notarial AS n ON d.id = n.id
      WHERE
        d.caratula_asunto_extracto LIKE ? OR
        d.tema LIKE ? OR
        pa.nombre LIKE ? OR
        dep.nombre LIKE ? OR
        m.lugar LIKE ? OR
        m.propiedad LIKE ? OR
        n.registro LIKE ? OR
        n.protocolo LIKE ?
    `

    // Ejecutar la consulta
    const [rows] = await connection.execute(
      sql,
      Array(8).fill(`%${searchTerm}%`)
    )

    res.status(200).json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener datos generales',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default getGeneral
