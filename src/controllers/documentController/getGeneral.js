const db = require('../../config/db')
const redis = require('redis')
const util = require('util')

const redisClient = redis.createClient()
const getAsync = util.promisify(redisClient.get).bind(redisClient)
const setAsync = util.promisify(redisClient.set).bind(redisClient)

const getAllDocuments = async (req, res) => {
  try {
    const {
      busqueda,
      tipo_documento,
      fecha_inicio,
      fecha_fin,
      pagina = 1,
      limite = 50
    } = req.query

    const offset = (pagina - 1) * limite

    // Intentar obtener resultados del caché
    const cacheKey = `search:${busqueda}:${tipo_documento}:${fecha_inicio}:${fecha_fin}:${pagina}:${limite}`
    const cachedResult = await getAsync(cacheKey)

    if (cachedResult) {
      return res.json(JSON.parse(cachedResult))
    }

    let query = `
      SELECT 
        d.id,
        d.tipo_documento,
        l.numero AS nro_legajo,
        l.es_bis AS legajo_bis,
        e.numero AS nro_expediente,
        e.es_bis AS expediente_bis,
        d.anio,
        d.mes,
        d.dia,
        d.caratula_asunto_extracto,
        d.tema,
        d.folios,
        p.nombre AS nombre_persona,
        dep.nombre AS nombre_departamento,
        CASE
          WHEN d.tipo_documento = 'Mensura' THEN m.propiedad
          WHEN d.tipo_documento = 'Notarial' THEN n.negocio_juridico
          ELSE NULL
        END AS info_adicional
      FROM documentos d
      LEFT JOIN expedientes e ON d.expediente_id = e.id
      LEFT JOIN legajos l ON e.legajo_id = l.id
      LEFT JOIN documentos_personas dp ON d.id = dp.documento_id
      LEFT JOIN personas_archivo p ON dp.persona_id = p.id
      LEFT JOIN documentos_departamentos dd ON d.id = dd.documento_id
      LEFT JOIN departamentos dep ON dd.departamento_id = dep.id
      LEFT JOIN mensura m ON d.id = m.id AND d.tipo_documento = 'Mensura'
      LEFT JOIN notarial n ON d.id = n.id AND d.tipo_documento = 'Notarial'
      WHERE 1=1
    `

    const params = []

    if (busqueda) {
      query += ` AND (d.caratula_asunto_extracto LIKE ? OR d.tema LIKE ? OR p.nombre LIKE ? 
                 OR dep.nombre LIKE ? OR m.propiedad LIKE ? OR n.negocio_juridico LIKE ?)`
      const busquedaParam = `%${busqueda}%`
      params.push(
        busquedaParam,
        busquedaParam,
        busquedaParam,
        busquedaParam,
        busquedaParam,
        busquedaParam
      )
    }

    if (tipo_documento) {
      query += ` AND d.tipo_documento = ?`
      params.push(tipo_documento)
    }

    if (fecha_inicio && fecha_fin) {
      query += ` AND (d.anio > ? OR (d.anio = ? AND d.mes > ?) OR (d.anio = ? AND d.mes = ? AND d.dia >= ?))
                 AND (d.anio < ? OR (d.anio = ? AND d.mes < ?) OR (d.anio = ? AND d.mes = ? AND d.dia <= ?))`
      const [anioInicio, mesInicio, diaInicio] = fecha_inicio.split('-')
      const [anioFin, mesFin, diaFin] = fecha_fin.split('-')
      params.push(
        anioInicio,
        anioInicio,
        mesInicio,
        anioInicio,
        mesInicio,
        diaInicio,
        anioFin,
        anioFin,
        mesFin,
        anioFin,
        mesFin,
        diaFin
      )
    }

    query += ` ORDER BY d.anio DESC, d.mes DESC, d.dia DESC LIMIT ? OFFSET ?`
    params.push(parseInt(limite), offset)

    const [results] = await db.query(query, params)
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM (${query.replace('SELECT', 'SELECT 1').split('ORDER BY')[0]}) as sub`,
      params
    )

    const totalDocumentos = countResult[0].total
    const totalPaginas = Math.ceil(totalDocumentos / limite)

    const response = {
      documentos: results,
      paginaActual: parseInt(pagina),
      totalPaginas,
      totalDocumentos
    }

    // Guardar en caché por 5 minutos
    await setAsync(cacheKey, JSON.stringify(response), 'EX', 300)

    res.json(response)
  } catch (error) {
    console.error('Error al obtener documentos:', error)
    res
      .status(500)
      .json({ mensaje: 'Error interno del servidor al buscar documentos.' })
  }
}

module.exports = getAllDocuments
