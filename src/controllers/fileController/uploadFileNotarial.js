// src/controllers/fileController/uploadFileNotarial.js

export const uploadFileNotarial = async (req, res) => {
  const connection = req.connection
  const documentoId = req.documentoId

  try {
    const {
      registro,
      protocolo,
      mesInicio,
      mesFin,
      escrituraNro,
      negocioJuridico
    } = req.body

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

    await connection.commit()

    res.json({
      message: 'Documento Notarial y archivo subidos y guardados correctamente',
      documentoId,
      expedienteId: req.expedienteId,
      legajoId: req.legajoId,
      personaId: req.personaId
    })
  } catch (error) {
    await connection.rollback()
    console.error('Error al guardar en la base de datos:', error)
    res
      .status(500)
      .send('Error al guardar el documento Notarial en la base de datos')
  } finally {
    connection.release()
  }
}
