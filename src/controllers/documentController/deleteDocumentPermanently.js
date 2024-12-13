// src/controllers/documentController/deleteDocumentPermanently.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'
import bcrypt from 'bcrypt' // Importa bcrypt para comparar contraseñas

async function deleteDocumentPermanently(req, res) {
  const { documentoId } = req.params
  const { contraseniaAdmin } = req.body // Recibir la clave de eliminación en el body de la solicitud

  let connection

  try {
    // Verificar si el usuario es administrador
    const user = await User.findById(req.user.id)
    if (user.rol !== 'administrador') {
      return res.status(403).json({
        message:
          'Acceso denegado. Solo los administradores pueden eliminar documentos permanentemente.'
      })
    }

    // Verificar la contraseña del administrador
    const isValidPassword = await bcrypt.compare(
      contraseniaAdmin,
      user.contrasena
    ) // Compara la contraseña proporcionada con la contraseña almacenada del administrador
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: 'Contraseña de administrador incorrecta.' })
    }

    connection = await dbConfig.getConnection()

    // Verificar si el documento existe y está marcado como eliminado
    const [documentRows] = await connection.execute(
      'SELECT esta_eliminado FROM documentos WHERE id = ?',
      [documentoId]
    )
    if (documentRows.length === 0 || documentRows[0].esta_eliminado !== 1) {
      return res.status(404).json({
        message:
          'Documento no encontrado o no está marcado para eliminación permanente.'
      })
    }

    // Eliminar el documento de la base de datos
    await connection.beginTransaction() // Iniciar una transacción

    // Eliminar las imágenes asociadas al documento
    await connection.execute('DELETE FROM imagenes WHERE documento_id = ?', [
      documentoId
    ])

    // Eliminar las relaciones del documento con departamentos
    await connection.execute(
      'DELETE FROM documentos_departamentos WHERE documento_id = ?',
      [documentoId]
    )

    // Eliminar las relaciones del documento con personas
    await connection.execute(
      'DELETE FROM documentos_personas WHERE documento_id = ?',
      [documentoId]
    )

    // Eliminar el documento de las tablas Mensura y Notarial (si aplica)
    await connection.execute('DELETE FROM mensura WHERE id = ?', [documentoId])
    await connection.execute('DELETE FROM notarial WHERE id = ?', [documentoId])

    // Eliminar el documento de la tabla Documentos
    await connection.execute('DELETE FROM documentos WHERE id = ?', [
      documentoId
    ])

    await connection.commit() // Confirmar la transacción

    res.status(200).json({ message: 'Documento eliminado permanentemente.' })
  } catch (error) {
    if (connection) {
      await connection.rollback() // Revertir la transacción en caso de error
    }
    console.error(error)
    res.status(500).json({
      message: 'Error al eliminar el documento permanentemente.',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default deleteDocumentPermanently
