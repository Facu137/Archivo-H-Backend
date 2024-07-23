import pool from "../../config/db.js";

const getFileUrl = (filename) => {
  return `http://localhost:3000/uploads/${filename}`;
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