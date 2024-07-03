import pool from "../config/db.js";
import path from "path";

const getFileUrl = (filename) => {
  return `http://localhost:3000/uploads/${filename}`;
};

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se subió ningún archivo");
  }

  try {
    const { autorIniciador, caratula, numeroFolios, tema, dia, mes, anio } = req.body;
const nombreArchivo = req.file.filename;

const [result] = await pool.query(
  "INSERT INTO archivos (autor_iniciador, caratula, numero_folios, tema, nombre_archivo, dia, mes, anio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  [autorIniciador, caratula, numeroFolios, tema, nombreArchivo, dia, mes, anio]
);

    res.json({
      message: "Archivo subido y guardado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al guardar en la base de datos:", error);
    res.status(500).send("Error al guardar el archivo en la base de datos");
  }
};

export const getFiles = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM archivos");
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: getFileUrl(file.nombre_archivo)
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    res.status(500).send("Error al obtener archivos de la base de datos");
  }
};

export const searchFilesByTopic = async (req, res) => {
  const { topic } = req.query;
  try {
    const [rows] = await pool.query("SELECT * FROM archivos WHERE tema LIKE ?", [`%${topic}%`]);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: getFileUrl(file.nombre_archivo)
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al buscar archivos por tema:", error);
    res.status(500).send("Error al buscar archivos por tema");
  }
};


export const searchFilesByAuthor = async (req, res) => {
  const { author } = req.query;
  try {
    const [rows] = await pool.query("SELECT * FROM archivos WHERE autor_iniciador LIKE ?", [`%${author}%`]);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: getFileUrl(file.nombre_archivo)
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al buscar archivos por autor:", error);
    res.status(500).send("Error al buscar archivos por autor");
  }
};

export const searchFilesByDate = async (req, res) => {
  const { startYear, endYear, startMonth, endMonth, startDay, endDay } = req.query;
  try {
    let query = "SELECT * FROM archivos WHERE anio BETWEEN ? AND ?";
    const params = [startYear, endYear];

    if (startMonth && endMonth) {
      query += " AND mes BETWEEN ? AND ?";
      params.push(startMonth, endMonth);
    }

    if (startDay && endDay) {
      query += " AND dia BETWEEN ? AND ?";
      params.push(startDay, endDay);
    }

    const [rows] = await pool.query(query, params);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: getFileUrl(file.nombre_archivo)
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al buscar archivos por fecha:", error);
    res.status(500).send("Error al buscar archivos por fecha");
  }
};

export const getFileById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM archivos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }
    const fileWithUrl = {
      ...rows[0],
      url: getFileUrl(rows[0].nombre_archivo)
    };
    res.json(fileWithUrl);
  } catch (error) {
    console.error("Error al obtener archivo por ID:", error);
    res.status(500).send("Error al obtener archivo por ID");
  }
};

export const getFilesByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM archivos WHERE usuario_id = ?", [userId]);
    const filesWithUrl = rows.map(file => ({
      ...file,
      url: getFileUrl(file.nombre_archivo)
    }));
    res.json(filesWithUrl);
  } catch (error) {
    console.error("Error al obtener archivos por usuario:", error);
    res.status(500).send("Error al obtener archivos por usuario");
  }
};