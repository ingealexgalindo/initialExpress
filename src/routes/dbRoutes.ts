import { Router } from "express";
import { saveFolder, getAllFolders } from "../controllers/dbControllers";

const router = Router();

//router.post("/folders", saveFolder); // Guardar carpeta
router.get("/folders", getAllFolders); // Obtener todas las carpetas

export default router;
