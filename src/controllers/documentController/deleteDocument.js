// src/controllers/documentController/deleteDocument.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'

async function deleteDocument(req, res) {
  const { id } = req.params
  let connection

  try {
    // Verificar si el usuario es administrador o empleado
    const user = await User.findById(req.user.id)
    if (user.rol !== 'administrador' && user.rol !== 'empleado') {
      return res
        .status(403)
        .json({ message: 'No eres empleado o administrador' })
    }

    // Verificar si el empleado tiene permiso de eliminar
    if (user.rol === 'empleado' && !user.permiso_eliminar) {
      return res
        .status(403)
        .json({ message: 'No tenes el permiso para eliminar archivos' })
    }

    connection = await dbConfig.getConnection()

    // Iniciar transacción
    await connection.beginTransaction()

    // Marcar el documento como eliminado y guardar el usuario que lo eliminó
    await connection.execute(
      'UPDATE documentos SET esta_eliminado = 1, fecha_marcado_eliminacion = NOW(), usuario_marcado_eliminacion = ? WHERE id = ?',
      [req.user.id, id]
    )

    // Registrar la acción en la tabla de auditoría
    await connection.execute(
      `INSERT INTO auditoria_cambios 
       (tabla_afectada, id_registro_afectado, tipo_documento, columna_modificada, valor_anterior, valor_nuevo, usuario_id)
       SELECT 'documentos', id, tipo_documento, 'esta_eliminado', '0', '1', ? 
       FROM documentos WHERE id = ?`,
      [req.user.id, id]
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
