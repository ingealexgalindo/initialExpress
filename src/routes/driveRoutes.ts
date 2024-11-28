import express, { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import {
  listFiles,
  authorize,
  getFolderStructure,
  getFolderStructureByDate,
} from "../controllers/driveController";

const router = express.Router();

// route to get all files
router.get("/files", async (req, res) => {
  try {
    const authClient = await authorize();
    const filesData = await listFiles(authClient);

    res.json(filesData);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: "Error to get files: " + err.message });
    } else {
      res.status(500).json({ error: "Error unknow to get files" });
    }
  }
});

// route to get folder structure
router.get("/folder-structure", async (req, res) => {
  try {
    const authClient = await authorize();
    const folderStructure = await getFolderStructure(authClient);
    res.json(folderStructure);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send("Error get structure: " + err.message);
    } else {
      res.status(500).send("Error unknow to get structure files.");
    }
  }
});

// Route to get folder structure
router.get("/folder-structure", async (req: Request, res: Response) => {
  try {
    const authClient: OAuth2Client = await authorize();
    const folderStructure = await getFolderStructure(authClient);
    res.json(folderStructure); // Responde con el tipo correcto
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send("Error getting structure: " + err.message);
    } else {
      res.status(500).send("Unknown error occurred while getting structure.");
    }
  }
});

// Route to get folder structure with files uploaded today
router.get("/folder-structure-today", async (req: Request, res: Response) => {
  try {
    const authClient: OAuth2Client = await authorize(); // Tu función para autorizar
    const folderStructure = await getFolderStructureByDate(authClient);
    res.json(folderStructure); // Envía la estructura con solo archivos subidos hoy
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send("Error getting folder structure: " + err.message);
    } else {
      res
        .status(500)
        .send("Unknown error occurred while getting folder structure.");
    }
  }
});

export default router;
