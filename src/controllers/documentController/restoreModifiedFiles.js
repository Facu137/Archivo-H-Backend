// src/controllers/documentController/restoreModifiedFiles.js
import dbConfig from '../../config/db.js'
import User from '../../models/User.js'

async function restoreModifiedFiles(req, res) {
  const { tabla, id, campo } = req.params // Recibir la tabla, el ID y el campo a restaurar
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

    // Obtener la última entrada de auditoría para el campo modificado
    const [auditRows] = await connection.execute(
      `
      SELECT valor_anterior, tipo_documento
      FROM auditoria_cambios
      WHERE tabla_afectada = ?
        AND id_registro_afectado = ?
        AND columna_modificada = ?
      ORDER BY fecha_hora DESC
      LIMIT 1
      `,
      [tabla, id, campo]
    )

    if (auditRows.length === 0) {
      return res.status(404).json({
        message:
          'No se encontraron modificaciones para restaurar en este campo.'
      })
    }

    // Actualizar el registro con el valor anterior
    const { valor_anterior, tipo_documento } = auditRows[0]

    await connection.execute(`UPDATE ${tabla} SET ${campo} = ? WHERE id = ?`, [
      valor_anterior,
      id
    ])

    // Registrar la restauración en la tabla de auditoría
    await connection.execute(
      `
      INSERT INTO auditoria_cambios (tabla_afectada, id_registro_afectado, tipo_documento, columna_modificada, valor_anterior, valor_nuevo, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tabla,
        id,
        tipo_documento,
        campo,
        valor_anterior,
        auditRows[0][campo],
        req.user.id
      ] // Usar el valor actual del campo como valor_nuevo
    )

    // Finalizar la transacción
    await connection.commit()

    res.status(200).json({ message: 'Registro restaurado correctamente' })
  } catch (error) {
    console.error(error)
    if (connection) await connection.rollback() // Revertir la transacción en caso de error
    res.status(500).json({
      message: 'Error al restaurar el registro',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default restoreModifiedFiles
