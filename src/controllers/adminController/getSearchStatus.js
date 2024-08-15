// src/controllers/adminController/getSearchStatus.js
import db from '../../config/db.js'

const getSearchStatus = async (req, res) => {
  const { personaId } = req.params

  try {
    const [results] = await db.query(
      'SELECT habilitar_busqueda_nuevos_empleados FROM administradores WHERE persona_id = ?',
      [personaId]
    )
    if (results.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado' })
    }
    res.status(200).json({
      habilitarBusquedaEmpleados: results[0].habilitar_busqueda_nuevos_empleados
    })
  } catch (err) {
    res.status(500).json({
      message: 'Error al obtener el estado de la búsqueda',
      error: err
    })
  }
}

export default getSearchStatus
