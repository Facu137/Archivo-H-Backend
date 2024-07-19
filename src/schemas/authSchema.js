// Schemas/authSchema.js
import { z } from 'zod'

const authSchema = z
  .object({
    email: z
      .string({ required_error: 'El correo electrónico es requerido' })
      .email({ message: 'Correo electrónico no válido' }),
    password: z
      .string({ required_error: 'La contraseña es requerida' })
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z
      .string({ required_error: 'La confirmación de contraseña es requerida' })
      .min(6, {
        message:
          'La confirmación de contraseña debe tener al menos 6 caracteres'
      }),
    nombre: z
      .string({ required_error: 'El nombre es requerido' })
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    apellido: z
      .string({ required_error: 'El apellido es requerido' })
      .min(2, { message: 'El apellido debe tener al menos 2 caracteres' }),
    rol: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'] // Indica que el error es en la confirmación de contraseña
  })

export default authSchema
