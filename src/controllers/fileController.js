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
    const { autorIniciador, caratula, numeroFolios, tema } = req.body;
    const nombreArchivo = req.file.filename;

    const [result] = await pool.query(
      "INSERT INTO archivos (autor_iniciador, caratula, numero_folios, tema, nombre_archivo) VALUES (?, ?, ?, ?, ?)",
      [autorIniciador, caratula, numeroFolios, tema, nombreArchivo]
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
    res.json(rows);
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
  const { startDate, endDate } = req.query;
  try {
    const [rows] = await pool.query("SELECT * FROM archivos WHERE fecha_creacion BETWEEN ? AND ?", [startDate, endDate]);
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