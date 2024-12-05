import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

export const convertToAvif = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next()
    }

    const convertPromises = req.files.map(async (file) => {
      const ext = path.extname(file.originalname).toLowerCase()
      // Solo procesar imágenes jpg, png, tiff
      if (['.jpg', '.jpeg', '.png', '.tiff'].includes(ext)) {
        const avifPath = file.path.replace(path.extname(file.path), '.avif')

        try {
          // Leer el archivo a un buffer primero
          const inputBuffer = await fs.readFile(file.path)

          // Obtener metadatos de la imagen original
          const metadata = await sharp(inputBuffer).metadata()

          // Calcular nuevas dimensiones manteniendo el aspect ratio
          let width = metadata.width
          let height = metadata.height

          // Si la imagen es muy grande, redimensionar manteniendo proporción
          const MAX_DIMENSION = 2000 // Ajusta según tus necesidades
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(
              MAX_DIMENSION / width,
              MAX_DIMENSION / height
            )
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          // Procesar desde el buffer con configuración optimizada
          const outputBuffer = await sharp(inputBuffer)
            .resize(width, height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .avif({
              quality: 65, // Reducido de 80 a 65 para mejor compresión
              effort: 9, // Máximo esfuerzo de compresión
              chromaSubsampling: '4:2:0', // Mejor compresión que 4:4:4
              lossless: false,
              speed: 0 // Más lento pero mejor compresión
            })
            .toBuffer()

          // Verificar que el buffer no está vacío
          if (!outputBuffer || outputBuffer.length === 0) {
            throw new Error('La conversión generó un buffer vacío')
          }

          // Obtener tamaño del archivo original
          const originalStats = await fs.stat(file.path)

          // Escribir el nuevo archivo
          await fs.writeFile(avifPath, outputBuffer)

          // Verificar que el archivo se creó correctamente
          const avifStats = await fs.stat(avifPath)

          // Comparar tamaños y decidir cuál mantener
          if (avifStats.size >= originalStats.size) {
            // Si el AVIF es más grande, mantener el original y eliminar el AVIF
            await fs.unlink(avifPath)
            console.log(
              `Manteniendo original para ${file.originalname} (AVIF: ${avifStats.size}, Original: ${originalStats.size} bytes)`
            )
            return
          }

          console.log(
            `Conversión exitosa: ${file.originalname} - Original: ${originalStats.size}, AVIF: ${avifStats.size} bytes (${Math.round((avifStats.size / originalStats.size) * 100)}%)`
          )

          // Cerrar explícitamente la instancia de sharp
          await sharp.cache(false)

          // Eliminar el archivo original solo si el AVIF es más pequeño
          await fs.unlink(file.path)

          // Actualizar la información del archivo en req.files
          file.filename = path.basename(avifPath)
          file.path = avifPath
          file.mimetype = 'image/avif'
        } catch (conversionError) {
          console.error('Error en la conversión:', conversionError)
          // Si hay error en la conversión, intentar limpiar el archivo AVIF si existe
          try {
            await fs.access(avifPath)
            await fs.unlink(avifPath)
          } catch {
            // Ignorar errores al intentar eliminar el archivo AVIF
          }
          throw new Error(
            `Error al convertir ${file.originalname}: ${conversionError.message}`
          )
        }
      }
      // Si es PDF, lo dejamos como está
      else if (ext !== '.pdf') {
        throw new Error(`Formato de archivo no soportado: ${ext}`)
      }
    })

    await Promise.all(convertPromises)
    next()
  } catch (error) {
    console.error('Error en el middleware de conversión:', error)
    next(error)
  }
}
