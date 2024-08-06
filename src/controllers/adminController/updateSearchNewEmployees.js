// src/controllers/adminController/updateSearchNewEmployees.js
import db from '../../config/db.js'

const updateSearchNewEmployees = async (req, res) => {
  const { personaId, habilitarBusquedaEmpleados } = req.body

  if (!personaId || habilitarBusquedaEmpleados === undefined) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos' })
  }

  const query =
    'UPDATE administradores SET habilitar_busqueda_nuevos_empleados = ? WHERE persona_id = ?'

  try {
    await db.query(query, [habilitarBusquedaEmpleados, personaId])
    res
      .status(200)
      .json({ message: 'Búsqueda de nuevos empleados actualizada con éxito' })
  } catch (err) {
    res.status(500).json({
      message: 'Error al actualizar la búsqueda de nuevos empleados',
      error: err
    })
  }
}

export default updateSearchNewEmployees
