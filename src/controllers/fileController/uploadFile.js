// src\controllers\fileController\uploadFile.js
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
      // Campo específicos para Departamento
      departamentoId,
      departamentoNombre,
      departamentoEsActual,
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
      registro,
      protocolo,
      mesInicio,
      mesFin,
      escrituraNro,
      negocioJuridico,
      lugar,
      propiedad,
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
      console.log('Datos insertados en la tabla Notarial')
    } else if (tipoDocumento === 'Mensura') {
      await connection.query(
        'INSERT INTO mensura (id, lugar, propiedad) VALUES (?, ?, ?)',
        [documentoId, lugar, propiedad]
      )
      console.log('Datos insertados en la tabla Mensura')
      // Insertar o actualizar departamento y crear relación
      if (departamentoNombre !== undefined) {
        let deptoId
        // Insertar o actualizar el departamento
        const [deptoResult] = await connection.query(
          'INSERT INTO departamentos (id, nombre, es_actual) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), es_actual = VALUES(es_actual)',
          [departamentoId || null, departamentoNombre, departamentoEsActual]
        )
        // eslint-disable-next-line prefer-const
        deptoId = departamentoId || deptoResult.insertId
        // Crear relación documento-departamento
        await connection.query(
          'INSERT INTO documentos_departamentos (documento_id, departamento_id) VALUES (?, ?)',
          [documentoId, deptoId]
        )
        console.log('Departamento insertado/actualizado y relación creada')
      } else {
        console.log(
          'No se proporcionó información del departamento para la mensura'
        )
      }
    }

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
