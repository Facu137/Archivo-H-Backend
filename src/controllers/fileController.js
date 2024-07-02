import pool from "../config/db.js";

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
