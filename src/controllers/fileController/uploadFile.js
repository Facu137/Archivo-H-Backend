import pool from '../../config/db.js'
import path from 'path'

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo')
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const {
      // Datos del legajo
      legajoNumero,
      legajoEsBis,
      // Datos del expediente
      expedienteNumero,
      expedienteEsBis,
      // Datos del documento
      tipoDocumento,
      anio,
      mes,
      dia,
      caratulaAsuntoExtracto,
      tema,
      folios,
      esPublico,
      creadorId,
      // Campos específicos para Notarial
      registro,
      protocolo,
      mesInicio,
      mesFin,
      escrituraNro,
      negocioJuridico,
      // Campos específicos para Mensura
      lugar,
      propiedad,
      // Datos de la persona
      personaNombre,
      personaTipo,
      personaRol
    } = req.body

    // Insertar o obtener legajo
    const [legajoResult] = await connection.query(
      'INSERT INTO legajos (numero, es_bis) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [legajoNumero, legajoEsBis]
    )
    const legajoId = legajoResult.insertId

    // Insertar expediente
    const [expedienteResult] = await connection.query(
      'INSERT INTO expedientes (legajo_id, numero, es_bis) VALUES (?, ?, ?)',
      [legajoId, expedienteNumero, expedienteEsBis]
    )
    const expedienteId = expedienteResult.insertId

    // Insertar documento
    const [documentoResult] = await connection.query(
      'INSERT INTO documentos (expediente_id, tipo_documento, anio, mes, dia, caratula_asunto_extracto, tema, folios, es_publico, creador_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        expedienteId,
        tipoDocumento,
        anio,
        mes,
        dia,
        caratulaAsuntoExtracto,
        tema,
        folios,
        esPublico,
        creadorId
      ]
    )
    const documentoId = documentoResult.insertId

    // Insertar en la tabla específica según el tipo de documento
    if (tipoDocumento === 'Notarial') {
      await connection.query(
        'INSERT INTO notarial (id, registro, protocolo, mes_inicio, mes_fin, escritura_nro, negocio_juridico) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          documentoId,
          registro,
          protocolo,
          mesInicio,
          mesFin,
          escrituraNro,
          negocioJuridico
        ]
      )
    } else if (tipoDocumento === 'Mensura') {
      await connection.query(
        'INSERT INTO mensura (id, lugar, propiedad) VALUES (?, ?, ?)',
        [documentoId, lugar, propiedad]
      )
    }

    // Insertar o obtener persona
    const [personaResult] = await connection.query(
      'INSERT INTO personas_archivo (nombre, tipo) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [personaNombre, personaTipo]
    )
    const personaId = personaResult.insertId

    // Relacionar persona con documento
    await connection.query(
      'INSERT INTO documentos_personas (documento_id, persona_id, rol) VALUES (?, ?, ?)',
      [documentoId, personaId, personaRol]
    )

    // Insertar la imagen asociada al documento
    await connection.query(
      'INSERT INTO imagenes (documento_id, url, tipo_imagen) VALUES (?, ?, ?)',
      [
        documentoId,
        req.file.filename,
        path.extname(req.file.originalname).slice(1)
      ]
    )

    await connection.commit()

    res.json({
      message: 'Documento y archivo subidos y guardados correctamente',
      documentoId,
      expedienteId,
      legajoId,
      personaId
    })
  } catch (error) {
    await connection.rollback()
    console.error('Error al guardar en la base de datos:', error)
    res.status(500).send('Error al guardar el documento en la base de datos')
  } finally {
    connection.release()
  }
}
