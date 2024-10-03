// src/utils/auditChanges.js

import dbConfig from '../../config/db.js'

async function auditChanges(
  tablaAfectada,
  idRegistroAfectado,
  tipoDocumento,
  columnaModificada,
  valorAnterior,
  valorNuevo,
  usuarioId
) {
  let connection

  try {
    connection = await dbConfig.getConnection()

    const sql = `
      INSERT INTO auditoria_cambios (
        tabla_afectada, 
        id_registro_afectado, 
        tipo_documento, 
        columna_modificada, 
        valor_anterior, 
        valor_nuevo, 
        usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      tablaAfectada,
      idRegistroAfectado,
      tipoDocumento,
      columnaModificada,
      valorAnterior,
      valorNuevo,
      usuarioId
    ]

    await connection.execute(sql, values)

    console.log(
      `Cambio auditado en la tabla ${tablaAfectada}, id: ${idRegistroAfectado}`
    )
  } catch (error) {
    console.error('Error al auditar cambios:', error)
    // Manejar el error de forma apropiada, como registrarlo en un archivo de logs
  } finally {
    if (connection) connection.release()
  }
}

export default auditChanges
