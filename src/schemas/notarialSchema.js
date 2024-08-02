// src/schemas/notarialSchema.js
import { z } from 'zod'

const baseSchema = z.object({
  // Campos comunes a todos los documentos
  legajoNumero: z.string().min(1, 'El número de legajo es requerido'),
  legajoEsBis: z.boolean(),
  expedienteNumero: z.string().min(1, 'El número de expediente es requerido'),
  expedienteEsBis: z.boolean(),
  tipoDocumento: z.literal('Notarial'),
  anio: z.number().int().min(1800).max(new Date().getFullYear()),
  mes: z.number().int().min(1).max(12).optional(),
  dia: z.number().int().min(1).max(31).optional(),
  caratulaAsuntoExtracto: z
    .string()
    .min(1, 'La carátula/asunto/extracto es requerido'),
  tema: z.string().min(1, 'El tema es requerido'),
  folios: z.number().int().positive('El número de folios debe ser positivo'),
  esPublico: z.boolean(),
  creadorId: z
    .number()
    .int()
    .positive('El ID del creador debe ser un número positivo'),
  personaNombre: z.string().min(1, 'El nombre de la persona es requerido'),
  personaTipo: z.enum(
    ['Persona Física', 'Persona Jurídica'],
    'Tipo de persona no válido'
  ),
  personaRol: z.enum(
    ['Iniciador', 'Titular', 'Escribano', 'Emisor', 'Destinatario'],
    'Rol de persona no válido'
  ),

  // Campos específicos de documentos notariales
  registro: z.string().min(1, 'El registro es requerido'),
  protocolo: z.string().min(1, 'El protocolo es requerido'),
  mesInicio: z.number().int().min(1).max(12),
  mesFin: z.number().int().min(1).max(12),
  escrituraNro: z.string().min(1, 'El número de escritura es requerido'),
  negocioJuridico: z.string().min(1, 'El negocio jurídico es requerido')
})

const fileSchema = z
  .object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z
      .string()
      .refine(
        (mime) => ['image/jpeg', 'image/png', 'application/pdf'].includes(mime),
        {
          message: 'Tipo de archivo no soportado. Use JPEG, PNG o PDF.'
        }
      ),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
    size: z.number().max(5000000, 'El archivo no debe superar los 5MB')
  })
  .optional()

export const notarialSchema = baseSchema.extend({
  file: fileSchema
})

export const validateNotarialUpload = (data) => {
  return notarialSchema.parse(data)
}
