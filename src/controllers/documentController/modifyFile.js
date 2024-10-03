// src/utils/modifyFile.js
import dbConfig from '../../config/db.js'
import User from '../models/User.js'
import auditChanges from './auditChanges.js'

async function modifyRecord(tabla, id, campos, req, res, tipoDocumento = null) {
  let connection

  try {
    // Verificar si el usuario tiene permiso
    const user = await User.findById(req.user.id)
    if (!['administrador', 'empleado'].includes(user.rol)) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para realizar esta acción.' })
    }

    connection = await dbConfig.getConnection()
    await connection.beginTransaction()

    if (tabla === 'personas_archivo' && campos.nombre) {
      // Insertar nueva persona en personas_archivo
      const [result] = await connection.execute(
        'INSERT INTO personas_archivo (nombre, tipo) VALUES (?, ?)',
        [campos.nombre, campos.tipo || 'Persona Física'] // Asumiendo que el tipo se proporciona o es 'Persona Física' por defecto
      )
      const nuevaPersonaId = result.insertId

      // Actualizar documentos_personas con la nueva persona
      await connection.execute(
        'UPDATE documentos_personas SET persona_id = ? WHERE documento_id = ? AND persona_id = ?',
        [nuevaPersonaId, campos.documento_id, id]
      )
      // Registrar la acción en la tabla de auditoría (inserción)
      await auditChanges(
        tabla,
        nuevaPersonaId,
        tipoDocumento,
        'nombre',
        null, // Valor anterior nulo porque es una inserción
        campos.nombre,
        req.user.id
      )
    } else {
      // Recorrer los campos a modificar
      for (const campo in campos) {
        // Obtener el valor anterior del campo
        const [valorAnteriorRows] = await connection.execute(
          `SELECT ${campo} FROM ${tabla} WHERE id = ?`,
          [id]
        )
        const valorAnterior = valorAnteriorRows[0][campo]

        // Actualizar el campo en la tabla
        await connection.execute(
          `UPDATE ${tabla} SET ${campo} = ? WHERE id = ?`,
          [campos[campo], id] // Usar campos[campo] para obtener el nuevo valor
        )

        // Registrar la acción en la tabla de auditoría
        await auditChanges(
          tabla,
          id,
          tipoDocumento,
          campo,
          valorAnterior,
          campos[campo], // Usar campos[campo] para obtener el nuevo valor
          req.user.id
        )
      }
    }
    await connection.commit()

    return res.status(200).json({
      message: `Registro en la tabla ${tabla} modificado correctamente.`
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error(error)
    return res.status(500).json({
      message: `Error al modificar el registro en la tabla ${tabla}.`,
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

export default modifyRecord
