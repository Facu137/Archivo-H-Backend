// src/controllers/adminController/updateEmployee.js
import db from '../../config/db.js'

const updateEmployee = async (req, res) => {
  const employeeId = req.params.employeeId
  const updates = req.body

  if (!employeeId) {
    return res.status(400).json({ message: 'Falta el ID del empleado' })
  }

  const allowedUpdates = [
    'activo',
    'permiso_crear',
    'permiso_editar',
    'permiso_eliminar',
    'permiso_descargar',
    'permiso_ver_archivos_privados'
  ]

  // Validar que solo se actualicen campos permitidos
  for (const key in updates) {
    if (!allowedUpdates.includes(key)) {
      return res
        .status(400)
        .json({ message: `No se permite actualizar el campo ${key}` })
    }
  }

  const connection = await db.getConnection()
  try {
    // Verificar si el empleado es sucesor de algún administrador
    const [sucesor] = await connection.query(
      'SELECT 1 FROM administradores WHERE sucesor = ?',
      [employeeId]
    )

    // Si el empleado es sucesor y se intenta desactivar, devolver un error
    if (sucesor.length > 0 && updates.activo === false) {
      return res.status(400).json({
        message:
          'No se puede desactivar a un empleado que es sucesor del administrador.'
      })
    }

    await connection.query(`UPDATE empleados SET ? WHERE persona_id = ?`, [
      updates,
      employeeId
    ])
    res.status(200).json({ message: 'Empleado actualizado con éxito' })
  } catch (error) {
    console.error('Error al actualizar empleado:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    connection.release()
  }
}

export default updateEmployee
