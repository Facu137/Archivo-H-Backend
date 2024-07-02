//configurar express
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// Cargar variables de entorno
config();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log("Hola Mundo, Conectado a la base de datos");
});
