import express from "express";
import cors from "cors";
import path from "path";

import { config } from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";


const app = express();
const port = process.env.PORT || 3000;

// Cargar variables de entorno y base de datos
config();

// Middlewares
app.use(cors()); // para aceptar peticiones de otros dominios
app.use(express.json()); // para analizar el body de las peticiones

// Rutas
app.use("/auth", authRoutes); // ruta de autenticación

app.use("/api", fileRoutes); // ruta para subir archivos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // ruta para subir archivos


// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
