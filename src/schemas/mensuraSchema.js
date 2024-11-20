// src/schemas/mensuraSchema.js
import { z } from 'zod'
import { fileSchema } from './fileSchema.js' // Importa fileSchema

const baseSchema = z.object({
  // Datos del legajo
  legajoNumero: z.string().min(1, 'El número de legajo es requerido'),
  legajoEsBis: z.preprocess(
    (val) => val === 'true' || val === true || val === 1,
    z.boolean()
  ),

  // Datos del expediente
  expedienteNumero: z.string().min(1, 'El número de expediente es requerido'),
  expedienteEsBis: z.preprocess(
    (val) => val === 'true' || val === true || val === 1,
    z.boolean()
  ),

  // Datos del documento
  tipoDocumento: z.literal('Mensura'),
  anio: z.coerce.number().int().max(new Date().getFullYear()),
  mes: z.coerce.number().int().min(1).max(12).optional(),
  dia: z.coerce.number().int().min(1).max(31).optional(),
  caratulaAsuntoExtracto: z
    .string()
    .min(1, 'La carátula/asunto/extracto es requerido'),
  tema: z.string().min(1, 'El tema es requerido'),
  folios: z.coerce
    .number()
    .int()
    .positive('El número de folios debe ser positivo'),
  esPublico: z.preprocess(
    (val) => val === 'true' || val === true || val === 1,
    z.boolean()
  ),
  creadorId: z.coerce
    .number()
    .int()
    .positive('El ID del creador debe ser un número positivo'),

  // Datos de la persona
  personaNombre: z.string().min(1, 'El nombre de la persona es requerido'),
  personaTipo: z.enum(
    ['Persona Física', 'Persona Jurídica'],
    'Tipo de persona no válido'
  ),
  personaRol: z.enum(
    ['Iniciador', 'Titular', 'Escribano', 'Emisor', 'Destinatario'],
    'Rol de persona no válido'
  ),

  // Campos específicos de Mensura
  lugar: z.string().optional(), // O define un valor por defecto si es necesario
  propiedad: z.string().optional(), // O define un valor por defecto si es necesario
  departamentoId: z.number().optional(), // Asegúrate de que sea opcional o tenga un valor por defecto
  departamentoNombre: z.string().optional(),
  departamentoEsActual: z.preprocess(
    (val) => val === 'true' || val === true || val === 1,
    z.boolean()
  ),
  file: z.any().optional() // Asegúrate de que el archivo sea opcional, ya que se maneja con multer
})

// El fileSchema no necesita cambios

export const mensuraSchema = z.object({
  // Datos del documento (NO dentro de "files")
  legajoNumero: z.string().min(1),
  legajoEsBis: z.preprocess(
    (val) => val === 'true' || val === true || val === 1,
    z.boolean()
  ),
  expedienteNumero: z.string().min(1),
  expedienteEsBis: z.preprocess(
    (val) => val === 'true' || val === true || val === 1,
    z.boolean()
  ),
  tipoDocumento: z.literal('Mensura'),
  anio: z.coerce.number().int().max(new Date().getFullYear()),
  // ... otros campos del documento
  personaNombre: z.string().min(1),
  personaTipo: z.enum(['Persona Física', 'Persona Jurídica']),
  personaRol: z.enum([
    'Iniciador',
    'Titular',
    'Escribano',
    'Emisor',
    'Destinatario'
  ]),
  lugar: z.string().optional(),
  propiedad: z.string().optional(),

  // Array de archivos (opcional, para las imágenes)
  files: z.array(z.any()).optional() // O usa fileSchema si necesitas validarlos individualmente
})

export const validateMensuraUpload = (data) => {
  console.log('Datos recibidos por validateMensuraUpload:', data) // Mantén esta línea para debugging
  return mensuraSchema.parse(data)
}
