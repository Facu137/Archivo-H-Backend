// src/controllers/fileController/uploadFileMensura.js
import { validateMensuraUpload } from '../../schemas/mensuraSchema.js'
import { verifyToken, checkRole } from '../../middlewares/authMiddleware.js'

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
          file: req.file
        })

        // Insertar o actualizar mensura
        const {
          lugar,
          propiedad,
          departamentoId,
          departamentoNombre,
          departamentoEsActual
        } = validatedData

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
      }
    })
  })
}
