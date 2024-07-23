import pool from "../../config/db.js";
import path from "path";

const getFileUrl = (filename) => {
  return `http://localhost:3000/uploads/${filename}`;
};

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se subió ningún archivo");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { 
      // Datos del legajo
      legajo_numero,
      legajo_es_bis,
      // Datos del expediente
      expediente_numero,
      expediente_es_bis,
      // Datos del documento
      tipo_documento, 
      anio, 
      mes, 
      dia, 
      caratula_asunto_extracto, 
      tema, 
      folios, 
      es_publico,
      creador_id,
      // Campos específicos para Notarial
      registro,
      protocolo,
      mes_inicio,
      mes_fin,
      escritura_nro,
      negocio_juridico,
      // Campos específicos para Mensura
      lugar,
      propiedad,
      // Datos de la persona
      persona_nombre,
      persona_tipo,
      persona_rol
    } = req.body;

    // Insertar o obtener legajo
    let [legajoResult] = await connection.query(
      "INSERT INTO legajos (numero, es_bis) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
      [legajo_numero, legajo_es_bis]
    );
    const legajo_id = legajoResult.insertId;

    // Insertar expediente
    let [expedienteResult] = await connection.query(
      "INSERT INTO expedientes (legajo_id, numero, es_bis) VALUES (?, ?, ?)",
      [legajo_id, expediente_numero, expediente_es_bis]
    );
    const expediente_id = expedienteResult.insertId;

    // Insertar documento
    const [documentoResult] = await connection.query(
      "INSERT INTO documentos (expediente_id, tipo_documento, anio, mes, dia, caratula_asunto_extracto, tema, folios, es_publico, creador_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [expediente_id, tipo_documento, anio, mes, dia, caratula_asunto_extracto, tema, folios, es_publico, creador_id]
    );
    const documento_id = documentoResult.insertId;

    // Insertar en la tabla específica según el tipo de documento
    if (tipo_documento === 'Notarial') {
      await connection.query(
        "INSERT INTO notarial (id, registro, protocolo, mes_inicio, mes_fin, escritura_nro, negocio_juridico) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [documento_id, registro, protocolo, mes_inicio, mes_fin, escritura_nro, negocio_juridico]
      );
    } else if (tipo_documento === 'Mensura') {
      await connection.query(
        "INSERT INTO mensura (id, lugar, propiedad) VALUES (?, ?, ?)",
        [documento_id, lugar, propiedad]
      );
    }

    // Insertar o obtener persona
    let [personaResult] = await connection.query(
      "INSERT INTO personas_archivo (nombre, tipo) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
      [persona_nombre, persona_tipo]
    );
    const persona_id = personaResult.insertId;

    // Relacionar persona con documento
    await connection.query(
      "INSERT INTO documentos_personas (documento_id, persona_id, rol) VALUES (?, ?, ?)",
      [documento_id, persona_id, persona_rol]
    );

    // Insertar la imagen asociada al documento
    await connection.query(
      "INSERT INTO imagenes (documento_id, url, tipo_imagen) VALUES (?, ?, ?)",
      [documento_id, req.file.filename, path.extname(req.file.originalname).slice(1)]
    );

    await connection.commit();

    res.json({
      message: "Documento y archivo subidos y guardados correctamente",
      documento_id: documento_id,
      expediente_id: expediente_id,
      legajo_id: legajo_id,
      persona_id: persona_id
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al guardar en la base de datos:", error);
    res.status(500).send("Error al guardar el documento en la base de datos");
  } finally {
    connection.release();
  }
};