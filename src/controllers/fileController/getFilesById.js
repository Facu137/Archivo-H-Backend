import pool from "../../config/db.js";

const getFileUrl = (filename) => {
  return `http://localhost:3000/uploads/${filename}`;
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