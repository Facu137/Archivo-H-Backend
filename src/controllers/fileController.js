// src\controllers\fileController.js
import pool from "../config/db.js";
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



export const getFiles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, i.url, i.tipo_imagen 
      FROM documentos d 
      LEFT JOIN imagenes i ON d.id = i.documento_id
    `);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: file.url ? getFileUrl(file.url) : null
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).send("Error al obtener documentos de la base de datos");
  }
};

export const searchFilesByTopic = async (req, res) => {
  const { topic } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT d.*, i.url, i.tipo_imagen 
      FROM documentos d 
      LEFT JOIN imagenes i ON d.id = i.documento_id
      WHERE d.tema LIKE ?
    `, [`%${topic}%`]);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: file.url ? getFileUrl(file.url) : null
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al buscar documentos por tema:", error);
    res.status(500).send("Error al buscar documentos por tema");
  }
};

export const searchFilesByDate = async (req, res) => {
  const { startYear, endYear, startMonth, endMonth, startDay, endDay } = req.query;
  try {
    let query = `
      SELECT d.*, i.url, i.tipo_imagen 
      FROM documentos d 
      LEFT JOIN imagenes i ON d.id = i.documento_id
      WHERE d.anio BETWEEN ? AND ?
    `;
    const params = [startYear, endYear];

    if (startMonth && endMonth) {
      query += " AND d.mes BETWEEN ? AND ?";
      params.push(startMonth, endMonth);
    }

    if (startDay && endDay) {
      query += " AND d.dia BETWEEN ? AND ?";
      params.push(startDay, endDay);
    }

    const [rows] = await pool.query(query, params);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: file.url ? getFileUrl(file.url) : null
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al buscar documentos por fecha:", error);
    res.status(500).send("Error al buscar documentos por fecha");
  }
};

export const getFileById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT d.*, i.url, i.tipo_imagen 
      FROM documentos d 
      LEFT JOIN imagenes i ON d.id = i.documento_id
      WHERE d.id = ?
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }
    const fileWithUrl = {
      ...rows[0],
      url: rows[0].url ? getFileUrl(rows[0].url) : null
    };
    res.json(fileWithUrl);
  } catch (error) {
    console.error("Error al obtener documento por ID:", error);
    res.status(500).send("Error al obtener documento por ID");
  }
};

export const getFilesByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT d.*, i.url, i.tipo_imagen 
      FROM documentos d 
      LEFT JOIN imagenes i ON d.id = i.documento_id
      WHERE d.creador_id = ?
    `, [userId]);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: file.url ? getFileUrl(file.url) : null
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al obtener documentos por usuario:", error);
    res.status(500).send("Error al obtener documentos por usuario");
  }
};