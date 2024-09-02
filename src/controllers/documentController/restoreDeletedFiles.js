// src/controllers/documentController/restoreDeletedFiles.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'

async function restoreDeletedFiles(req, res) {
  const { documentoId } = req.params
  let connection

  try {
    // Verificar si el usuario es administrador o empleado
    const user = await User.findById(req.user.id)
    if (user.rol !== 'administrador' && user.rol !== 'empleado') {
      return res.status(403).json({ message: 'Acceso denegado' })
    }

    connection = await dbConfig.getConnection()

    // Iniciar transacción
    await connection.beginTransaction()

    // Obtener la última entrada de auditoría para el documento eliminado
    const [auditRows] = await connection.execute(
      `
      SELECT columna_modificada, valor_anterior
      FROM auditoria_cambios
      WHERE tabla_afectada = 'documentos'
        AND id_registro_afectado = ?
        AND columna_modificada = 'esta_eliminado'
        AND valor_nuevo = '1'
      ORDER BY fecha_hora DESC
      LIMIT 1
      `,
      [documentoId]
    )

    if (auditRows.length === 0) {
      return res.status(404).json({
        message:
          'No se encontró el documento eliminado o no hay cambios para restaurar.'
      })
    }

    // Actualizar el documento con el valor anterior
    const { columna_modificada, valor_anterior } = auditRows[0]

    await connection.execute(
      `UPDATE documentos SET ${columna_modificada} = ? WHERE id = ?`,
      [valor_anterior, documentoId]
    )

    // Registrar la restauración en la tabla de auditoría
    await connection.execute(
      `
      INSERT INTO auditoria_cambios (tabla_afectada, id_registro_afectado, tipo_documento, columna_modificada, valor_anterior, valor_nuevo, usuario_id)
      SELECT 'documentos', ?, tipo_documento, ?, ?, '0', ?
      FROM documentos WHERE id = ?
      `,
      [documentoId, columna_modificada, '1', req.user.id, documentoId]
    )

    // Finalizar la transacción
    await connection.commit()

    res.status(200).json({ message: 'Documento restaurado correctamente' })
  } catch (error) {
    console.error(error)
    if (connection) await connection.rollback() // Revertir la transacción en caso de error
    res.status(500).json({
      message: 'Error al restaurar el documento',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default restoreDeletedFiles
