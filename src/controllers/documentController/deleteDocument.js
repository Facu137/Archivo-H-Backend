// src/controllers/documentController/deleteDocument.js
import dbConfig from '../../config/db.js'

async function deleteDocument(req, res) {
  const { id } = req.params
  let connection

  try {
    connection = await dbConfig.getConnection()

    // Iniciar transacción
    await connection.beginTransaction()

    // Marcar el documento como eliminado
    await connection.execute(
      'UPDATE documentos SET esta_eliminado = 1, fecha_marcado_eliminacion = NOW() WHERE id = ?',
      [id]
    )

    // Registrar la acción en la tabla de auditoría
    await connection.execute(
      `INSERT INTO auditoria_cambios 
       (tabla_afectada, id_registro_afectado, tipo_documento, columna_modificada, valor_anterior, valor_nuevo, usuario_id)
       SELECT 'documentos', id, tipo_documento, 'esta_eliminado', '0', '1', ? 
       FROM documentos WHERE id = ?`,
      [req.user.id, id] // Asumiendo que tienes el ID del usuario en req.user.id
    )

    // Commit de la transacción
    await connection.commit()

    res
      .status(200)
      .json({ message: 'Documento marcado como eliminado correctamente' })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error(error)
    res.status(500).json({
      message: 'Error al marcar el documento como eliminado',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default deleteDocument
