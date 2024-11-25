import express, { Request, Response } from "express";

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo
app.get("/", (req: Request, res: Response) => {
  res.send("¡Hola, Express con TypeScript! Alex Galindo Fuentes");
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
