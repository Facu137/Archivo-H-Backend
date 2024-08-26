// src/controllers/authController/me.js
import User from '../../models/User.js'

const me = async (req, res) => {
  try {
    // Obtener el ID del usuario del token decodificado
    const userId = req.user.id

    // Buscar al usuario en la base de datos
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Crear un objeto base para la información del usuario
    const userInfo = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol
    }

    // Si el usuario es un empleado, obtener su estado y permisos
    if (user.rol === 'empleado') {
      const employee = await User.findEmployeeById(userId)
      userInfo.activo = employee.activo
      userInfo.permisos = {
        crear: employee.permiso_crear,
        editar: employee.permiso_editar,
        eliminar: employee.permiso_eliminar,
        descargar: employee.permiso_descargar,
        verArchivosPrivados: employee.permiso_ver_archivos_privados
      }
    }

    // Devolver la información del usuario
    return res.status(200).json(userInfo)
  } catch (error) {
    console.error('Error al obtener la información del usuario:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export default me
