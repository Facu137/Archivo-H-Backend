// src/controllers/fileController/uploadFileMensura.js

export const uploadFileMensura = async (req, res) => {
  const connection = req.connection
  const documentoId = req.documentoId

  try {
    const {
      lugar,
      propiedad,
      departamentoId,
      departamentoNombre,
      departamentoEsActual
    } = req.body

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
      message: 'Documento Mensura y archivo subidos y guardados correctamente',
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
      .send('Error al guardar el documento Mensura en la base de datos')
  } finally {
    connection.release()
  }
}