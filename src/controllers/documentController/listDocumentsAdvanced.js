// src/controllers/documentController/listDocumentsAdvanced.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'
import jwt from 'jsonwebtoken'

async function getAdvancedSearch(req, res) {
  const {
    legajo,
    legajoBis,
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
    negocio_juridico,
    tipo_documento
  } = req.query

  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 100

  let connection
  let user = null

  try {
    // Intenta verificar el token si está presente
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies.refreshToken
    if (token) {
      user = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    }

    // Consulta SQL para el conteo total
    let countSql = `
      SELECT COUNT(*) AS total
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
      d.esta_eliminado = 0 AND 1=1
    `

    // Consulta SQL principal
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
        l.es_bis AS legajo_es_bis,
        e.numero AS expediente_numero,
        e.es_bis AS expediente_es_bis,
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
      WHERE
      d.esta_eliminado = 0 AND 1=1
    `

    const values = []

    // Añadir filtros a ambas consultas
    const addFilter = (condition, value) => {
      sql += ` AND ${condition}`
      countSql += ` AND ${condition}`
      if (value !== undefined) {
        values.push(value)
      }
    }

    if (legajo) addFilter('l.numero = ?', legajo)
    if (legajoBis) addFilter('l.es_bis = ?', legajoBis)
    if (expediente) addFilter('e.numero = ?', expediente)
    if (expedienteBis) addFilter('e.es_bis = ?', expedienteBis)
    if (departamento)
      addFilter('dep.nombre = ? AND dep.es_actual = 1', departamento)
    if (lugar) addFilter('m.lugar LIKE ?', `%${lugar}%`)
    if (dia) addFilter('d.dia = ?', dia)
    if (anio) addFilter('d.anio = ?', anio)
    if (titular)
      addFilter('dp.rol = ? AND pa.nombre LIKE ?', ['Titular', `%${titular}%`])
    if (iniciador)
      addFilter('dp.rol = ? AND pa.nombre LIKE ?', [
        'Iniciador',
        `%${iniciador}%`
      ])
    if (escribano)
      addFilter('dp.rol = ? AND pa.nombre LIKE ?', [
        'Escribano',
        `%${escribano}%`
      ])
    if (emisor)
      addFilter('dp.rol = ? AND pa.nombre LIKE ?', ['Emisor', `%${emisor}%`])
    if (destinatario)
      addFilter('dp.rol = ? AND pa.nombre LIKE ?', [
        'Destinatario',
        `%${destinatario}%`
      ])
    if (caratula)
      addFilter('d.caratula_asunto_extracto LIKE ?', `%${caratula}%`)
    if (propiedad) addFilter('m.propiedad LIKE ?', `%${propiedad}%`)
    if (folios) addFilter('d.folios = ?', folios)
    if (registro) addFilter('n.registro = ?', registro)
    if (protocolo) addFilter('n.protocolo = ?', protocolo)
    if (mes_inicio) addFilter('n.mes_inicio = ?', mes_inicio)
    if (mes_fin) addFilter('n.mes_fin = ?', mes_fin)
    if (escritura_nro) addFilter('n.escritura_nro = ?', escritura_nro)
    if (negocio_juridico)
      addFilter('n.negocio_juridico LIKE ?', `%${negocio_juridico}%`)
    if (tipo_documento) addFilter('d.tipo_documento = ?', tipo_documento)

    // Modifica la condición del WHERE para incluir la verificación del token
    if (
      !user ||
      (user.rol !== 'administrador' &&
        !(user.rol === 'empleado' && user.permiso_ver_archivos_privados))
    ) {
      // Si no hay token o el usuario no tiene permisos, solo mostrar documentos públicos
      sql += ' AND d.es_publico = 1'
      countSql += ' AND d.es_publico = 1'
    }

    connection = await dbConfig.getConnection()

    // Obtener el conteo total
    const [countRows] = await connection.execute(countSql, values)
    const totalCount = countRows[0].total

    // Añadir paginación a la consulta principal
    sql += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`

    // Ejecutar la consulta principal
    const [rows] = await connection.execute(sql, values)

    res.status(200).json({
      results: rows,
      totalCount,
      page,
      pageSize
    })
  } catch (error) {
    console.error(error)

    // Si hay un error de token, devolver un error 401 (Unauthorized)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' })
    }

    res.status(500).json({
      message: 'Error al obtener datos de búsqueda avanzada',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default getAdvancedSearch
