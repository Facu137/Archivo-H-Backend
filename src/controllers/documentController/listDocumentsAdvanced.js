// src/controllers/documentController/getAdvancedSearch.js
import dbConfig from '../../config/db.js'

async function getAdvancedSearch(req, res) {
  const {
    legajo,
    legjajoBis,
    expediente,
    expedienteBis,
    departamento,
    lugar,
    dia,
    anio,
    titular,
    iniciador,
    escribano,
    emisor,
    destinatario,
    caratula,
    propiedad,
    folios,
    registro,
    protocolo,
    mes_inicio,
    mes_fin,
    escritura_nro,
    negocio_juridico
  } = req.query

  let connection

  try {
    connection = await dbConfig.getConnection()

    // Construir la consulta SQL
    let sql = `
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
        n.protocolo AS notarial_protocolo,
        n.mes_inicio AS notarial_mes_inicio,
        n.mes_fin AS notarial_mes_fin,
        n.escritura_nro AS notarial_escritura_nro,
        n.negocio_juridico AS notarial_negocio_juridico
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
      WHERE 1=1
    `

    // Añadir filtros a la consulta SQL
    if (legajo) {
      sql += ' AND l.numero = ?'
    }
    if (legjajoBis) {
      sql += ' AND l.es_bis = ?'
    }
    if (expediente) {
      sql += ' AND e.numero = ?'
    }
    if (expedienteBis) {
      sql += ' AND e.es_bis = ?'
    }
    if (departamento) {
      sql += ' AND dep.nombre = ? AND dep.es_actual = 1'
    }
    if (lugar) {
      sql += ' AND m.lugar LIKE ?'
    }
    if (dia) {
      sql += ' AND d.dia = ?'
    }
    if (anio) {
      sql += ' AND d.anio = ?'
    }
    if (titular) {
      sql += ' AND dp.rol = ? AND pa.nombre LIKE ?'
    }
    if (iniciador) {
      sql += ' AND dp.rol = ? AND pa.nombre LIKE ?'
    }
    if (escribano) {
      sql += ' AND dp.rol = ? AND pa.nombre LIKE ?'
    }
    if (emisor) {
      sql += ' AND dp.rol = ? AND pa.nombre LIKE ?'
    }
    if (destinatario) {
      sql += ' AND dp.rol = ? AND pa.nombre LIKE ?'
    }
    if (caratula) {
      sql += ' AND d.caratula_asunto_extracto LIKE ?'
    }
    if (propiedad) {
      sql += ' AND m.propiedad LIKE ?'
    }
    if (folios) {
      sql += ' AND d.folios = ?'
    }
    if (registro) {
      sql += ' AND n.registro = ?'
    }
    if (protocolo) {
      sql += ' AND n.protocolo = ?'
    }
    if (mes_inicio) {
      sql += ' AND n.mes_inicio = ?'
    }
    if (mes_fin) {
      sql += ' AND n.mes_fin = ?'
    }
    if (escritura_nro) {
      sql += ' AND n.escritura_nro = ?'
    }
    if (negocio_juridico) {
      sql += ' AND n.negocio_juridico LIKE ?'
    }

    // Ejecutar la consulta
    const values = []
    if (legajo) values.push(legajo)
    if (legjajoBis) values.push(legjajoBis)
    if (expediente) values.push(expediente)
    if (expedienteBis) values.push(expedienteBis)
    if (departamento) values.push(departamento)
    if (lugar) values.push(`%${lugar}%`)
    if (dia) values.push(dia)
    if (anio) values.push(anio)
    if (titular) {
      values.push('Titular', `%${titular}%`)
    }
    if (iniciador) {
      values.push('Iniciador', `%${iniciador}%`)
    }
    if (escribano) {
      values.push('Escribano', `%${escribano}%`)
    }
    if (emisor) {
      values.push('Emisor', `%${emisor}%`)
    }
    if (destinatario) {
      values.push('Destinatario', `%${destinatario}%`)
    }
    if (caratula) {
      values.push(`%${caratula}%`)
    }
    if (propiedad) {
      values.push(`%${propiedad}%`)
    }
    if (folios) {
      values.push(folios)
    }
    if (registro) {
      values.push(registro)
    }
    if (protocolo) {
      values.push(protocolo)
    }
    if (mes_inicio) {
      values.push(mes_inicio)
    }
    if (mes_fin) {
      values.push(mes_fin)
    }
    if (escritura_nro) {
      values.push(escritura_nro)
    }
    if (negocio_juridico) {
      values.push(`%${negocio_juridico}%`)
    }

    const [rows] = await connection.execute(sql, values)

    res.status(200).json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener datos de búsqueda avanzada',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default getAdvancedSearch