// src/controllers/fileController/uploadFileGeneral.js
import pool from '../../config/db.js'
import path from 'path'
import { validateFileUpload } from '../../schemas/fileSchema.js'
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js'

export const uploadFileGeneral = async (req, res) => {
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

        // Buscar persona existente
        const [existingPersona] = await connection.query(
          'SELECT id FROM personas_archivo WHERE nombre = ? AND tipo = ?',
          [personaNombre, personaTipo]
        )

        let personaId

        if (existingPersona.length > 0) {
          // Persona ya existe
          personaId = existingPersona[0].id
        } else {
          // Insertar nueva persona
          const [personaResult] = await connection.query(
            'INSERT INTO personas_archivo (nombre, tipo) VALUES (?, ?)',
            [personaNombre, personaTipo]
          )
          personaId = personaResult.insertId
        }

        // Relacionar persona con documento
        await connection.query(
          'INSERT INTO documentos_personas (documento_id, persona_id, rol) VALUES (?, ?, ?)',
          [documentoId, personaId, personaRol]
        )

        // Insertar la imagen asociada al documento
        const imagenesSubidas = []
        if (req.files && req.files.length > 0) {
          // Verifica si se subieron archivos
          for (const file of req.files) {
            const [imageResult] = await connection.query(
              'INSERT INTO imagenes (documento_id, url, tipo_imagen) VALUES (?, ?, ?)',
              [
                documentoId,
                file.filename,
                path.extname(file.originalname).slice(1)
              ]
            )
            imagenesSubidas.push({
              id: imageResult.insertId,
              nombre: file.filename,
              tipo: file.mimetype
            })
          }
        } else {
          console.warn('No se subieron imágenes para este documento.')
        }
        await connection.commit()

        // Enviar respuesta de éxito
        return res.status(200).json({
          success: true,
          message: 'Documento subido exitosamente',
          data: {
            documentoId,
            expedienteId,
            legajoId,
            personaId,
            imagenes: imagenesSubidas
          }
        })
      } catch (error) {
        await connection.rollback()

        if (error.name === 'ZodError') {
          return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: error.errors
          })
        }

        console.error('Error al guardar en la base de datos:', error)
        return res.status(500).json({
          success: false,
          message: 'Error al guardar el documento en la base de datos',
          error: error.message
        })
      } finally {
        connection.release()
      }
    })
  })
}
