// src/controllers/documentController/getGeneral.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'
import jwt from 'jsonwebtoken'

async function getGeneral(req, res) {
  const searchTerm = req.query.search
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 100

  if (!searchTerm) {
    return res.status(400).json({ message: 'Término de búsqueda requerido' })
  }

  let connection
  let user = null

  try {
    // Intenta verificar el token si está presente
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies.refreshToken
    if (token) {
      user = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    }

    // Consulta SQL para obtener el conteo total de resultados
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
        d.esta_eliminado = 0
        AND (
          d.caratula_asunto_extracto LIKE ? OR
          d.tema LIKE ? OR
          pa.nombre LIKE ? OR
          dep.nombre LIKE ? OR
          m.lugar LIKE ? OR
          m.propiedad LIKE ? OR
          n.registro LIKE ? OR
          n.protocolo LIKE ?
        )
    `

    // Consulta SQL con JOIN para las tablas especificadas
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
        d.esta_eliminado = 0
        AND (
          d.caratula_asunto_extracto LIKE ? OR
          d.tema LIKE ? OR
          pa.nombre LIKE ? OR
          dep.nombre LIKE ? OR
          m.lugar LIKE ? OR
          m.propiedad LIKE ? OR
          n.registro LIKE ? OR
          n.protocolo LIKE ?
        )
    `

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

    sql += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`

    connection = await dbConfig.getConnection()

    // Ejecutar la consulta de conteo
    const [countRows] = await connection.execute(
      countSql,
      Array(8).fill(`%${searchTerm}%`)
    )
    const totalCount = countRows[0].total

    // Ejecutar la consulta principal
    const [rows] = await connection.execute(
      sql,
      Array(8).fill(`%${searchTerm}%`)
    )

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
      message: 'Error al obtener datos generales',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default getGeneral
