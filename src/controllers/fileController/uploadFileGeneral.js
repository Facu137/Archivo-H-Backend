// src/controllers/fileController/uploadFileGeneral.js
import pool from '../../config/db.js'
import path from 'path'
import { validateFileUpload } from '../../schemas/fileSchema.js'
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js'

export const uploadFileGeneral = async (req, res, next) => {
  // Verificar token y rol antes de procesar la solicitud
  verifyToken(req, res, () => {
    checkRole(['empleado', 'administrador'])(req, res, async () => {
      const connection = await pool.getConnection()

      try {
        // Validar los datos de entrada
        const validatedData = validateFileUpload({
          ...req.body,
          file: req.file
        })

        // Si la validación pasa, destructurar los datos validados
        const {
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
        } = validatedData

        await connection.beginTransaction()

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
        if (req.file) {
          await connection.query(
            'INSERT INTO imagenes (documento_id, url, tipo_imagen) VALUES (?, ?, ?)',
            [
              documentoId,
              req.file.filename,
              path.extname(req.file.originalname).slice(1)
            ]
          )
        }

        await connection.commit()

        // Pasar la conexión y los IDs a la siguiente función
        req.connection = connection
        req.documentoId = documentoId
        req.expedienteId = expedienteId
        req.legajoId = legajoId
        req.personaId = personaId

        res.status(201).json({
          message: 'Documento subido y registrado con éxito',
          documentoId,
          expedienteId,
          legajoId,
          personaId
        })

        next()
      } catch (error) {
        await connection.rollback()

        if (error.name === 'ZodError') {
          return res.status(400).json({
            message: 'Error de validación',
            errors: error.errors
          })
        }

        console.error('Error al guardar en la base de datos:', error)
        res.status(500).json({
          message: 'Error al guardar el documento en la base de datos'
        })
      } finally {
        connection.release()
      }
    })
  })
}
