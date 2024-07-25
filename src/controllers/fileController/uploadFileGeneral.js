// src/controllers/fileController/uploadFileGeneral.js
import pool from '../../config/db.js'
import path from 'path'

export const uploadFileGeneral = async (req, res, next) => {
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
      // Datos de la persona
      personaNombre,
      personaTipo,
      personaRol
    } = req.body

    console.log('Datos recibidos:', {
      legajoNumero,
      legajoEsBis,
      expedienteNumero,
      expedienteEsBis,
      tipoDocumento,
      anio,
      mes,
      dia,
      caratulaAsuntoExtracto,
      tema,
      folios,
      esPublico,
      creadorId,
      personaNombre,
      personaTipo,
      personaRol
    })

    // Insertar o obtener legajo
    const [legajoResult] = await connection.query(
      'INSERT INTO legajos (numero, es_bis) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [legajoNumero, legajoEsBis]
    )
    const legajoId = legajoResult.insertId

    console.log('Legajo insertado/obtenido con ID:', legajoId)

    // Insertar expediente
    const [expedienteResult] = await connection.query(
      'INSERT INTO expedientes (legajo_id, numero, es_bis) VALUES (?, ?, ?)',
      [legajoId, expedienteNumero, expedienteEsBis]
    )
    const expedienteId = expedienteResult.insertId

    console.log('Expediente insertado con ID:', expedienteId)

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

    console.log('Documento insertado con ID:', documentoId)

    // Insertar o obtener persona
    const [personaResult] = await connection.query(
      'INSERT INTO personas_archivo (nombre, tipo) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [personaNombre, personaTipo]
    )
    const personaId = personaResult.insertId

    console.log('Persona insertada/obtenida con ID:', personaId)

    // Relacionar persona con documento
    await connection.query(
      'INSERT INTO documentos_personas (documento_id, persona_id, rol) VALUES (?, ?, ?)',
      [documentoId, personaId, personaRol]
    )

    console.log('Persona relacionada con documento')

    // Insertar la imagen asociada al documento
    await connection.query(
      'INSERT INTO imagenes (documento_id, url, tipo_imagen) VALUES (?, ?, ?)',
      [
        documentoId,
        req.file.filename,
        path.extname(req.file.originalname).slice(1)
      ]
    )

    console.log('Imagen insertada con URL:', req.file.filename)

    // Pasar la conexión y los IDs a la siguiente función
    req.connection = connection
    req.documentoId = documentoId
    req.expedienteId = expedienteId
    req.legajoId = legajoId
    req.personaId = personaId

    next()
  } catch (error) {
    await connection.rollback()
    console.error('Error al guardar en la base de datos:', error)
    res.status(500).send('Error al guardar el documento en la base de datos')
  }
}
