import express from "express";
import bodyParser from "body-parser";
import driveRoutes from "./routes/driveRoutes"; // Rutas de Google Drive

// Crear la aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para procesar los cuerpos de las solicitudes en JSON
app.use(bodyParser.json());

// Configurar rutas de Google Drive
app.use("/api/drive", driveRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;
