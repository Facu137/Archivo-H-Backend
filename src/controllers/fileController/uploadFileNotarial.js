// src/controllers/fileController/uploadFileNotarial.js
import { validateNotarialUpload } from '../../schemas/notarialSchema.js'
import { uploadFileGeneral } from './uploadFileGeneral.js'

export const uploadFileNotarial = async (req, res, next) => {
  try {
    // Validar los datos de entrada específicos de documentos notariales
    const validatedData = validateNotarialUpload({
      ...req.body,
      file: req.file
    })

    // Extraer los datos específicos de documentos notariales
    const {
      registro,
      protocolo,
      mesInicio,
      mesFin,
      escrituraNro,
      negocioJuridico
    } = validatedData

    // Llamar a la función general de carga de archivos
    await uploadFileGeneral(req, res, async () => {
      const connection = req.connection
      const documentoId = req.documentoId

      // Insertar datos específicos de documentos notariales
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

      await connection.commit()

      res.status(201).json({
        message: 'Documento Notarial subido y registrado con éxito',
        documentoId: req.documentoId,
        expedienteId: req.expedienteId,
        legajoId: req.legajoId,
        personaId: req.personaId
      })
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Error de validación en datos de documento notarial',
        errors: error.errors
      })
    }

    console.error('Error al procesar el documento notarial:', error)
    res.status(500).json({ message: 'Error al procesar el documento notarial' })
  }
}
