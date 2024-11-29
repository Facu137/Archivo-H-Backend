// src/controllers/fileController/uploadFileMensura.js
import { validateMensuraUpload } from '../../schemas/mensuraSchema.js'
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js'
import path from 'path'

export const uploadFileMensura = async (req, res) => {
  console.log('req.body en uploadFileMensura:', req.body) // Agrega esta línea
  // Verificar token y rol antes de procesar la solicitud
  verifyToken(req, res, () => {
    checkRole(['empleado', 'administrador'])(req, res, async () => {
      const connection = req.connection
      const documentoId = req.documentoId

      try {
        // Validar los datos de entrada específicos de mensura
        const validatedData = validateMensuraUpload({
          ...req.body,
          files: req.files
        })

        // Insertar o actualizar mensura
        const {
          lugar,
          propiedad,
          departamentoNombreActual,
          departamentoNombreAntiguo
        } = validatedData

        await connection.query(
          'INSERT INTO mensura (id, lugar, propiedad) VALUES (?, ?, ?)',
          [documentoId, lugar, propiedad]
        )
        console.log('Datos insertados en la tabla Mensura')

        // Insertar departamento actual y crear relación
        if (departamentoNombreActual) {
          const [deptoActualResult] = await connection.query(
            'INSERT INTO departamentos (nombre, es_actual) VALUES (?, true)',
            [departamentoNombreActual]
          )
          const deptoActualId = deptoActualResult.insertId

          // Crear relación documento-departamento actual
          await connection.query(
            'INSERT INTO documentos_departamentos (documento_id, departamento_id) VALUES (?, ?)',
            [documentoId, deptoActualId]
          )
          console.log('Departamento actual insertado y relación creada')
        }

        // Insertar departamento antiguo y crear relación
        if (departamentoNombreAntiguo) {
          const [deptoAntiguoResult] = await connection.query(
            'INSERT INTO departamentos (nombre, es_actual) VALUES (?, false)',
            [departamentoNombreAntiguo]
          )
          const deptoAntiguoId = deptoAntiguoResult.insertId

          // Crear relación documento-departamento antiguo
          await connection.query(
            'INSERT INTO documentos_departamentos (documento_id, departamento_id) VALUES (?, ?)',
            [documentoId, deptoAntiguoId]
          )
          console.log('Departamento antiguo insertado y relación creada')
        }

        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            // Insertar cada archivo en la tabla 'imagenes'
            await connection.query(
              'INSERT INTO imagenes (documento_id, url, tipo_imagen) VALUES (?, ?, ?)',
              [
                documentoId,
                file.filename, // Nombre del archivo en el servidor
                path.extname(file.originalname).slice(1) // Extensión del archivo
              ]
            )
          }
          console.log('Archivos insertados en la tabla Imagenes')
        } else {
          console.warn('No se subieron imágenes para este documento.')
        }

        await connection.commit()

        res.json({
          message:
            'Documento Mensura y archivo subidos y guardados correctamente',
          documentoId,
          expedienteId: req.expedienteId,
          legajoId: req.legajoId,
          personaId: req.personaId
        })
      } catch (error) {
        if (error.name === 'ZodError') {
          return res.status(400).json({
            message: 'Error de validación en datos de mensura',
            errors: error.errors
          })
        }

        console.error('Error al procesar el documento de mensura:', error)
        res
          .status(500)
          .json({ message: 'Error al procesar el documento de mensura' })
      } finally {
        if (connection) connection.release()
      }
    })
  })
}
