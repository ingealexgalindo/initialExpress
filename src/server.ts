import express from "express";
import bodyParser from "body-parser";
import driveRoutes from "./routes/driveRoutes";
import folderRoutes from "./routes/dbRoutes";

// config Application Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware to use json
app.use(bodyParser.json());

// routes google drive
app.use("/api/drive", driveRoutes);

// routes db folders
app.use("/api/db", folderRoutes);

// Starting server
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;
