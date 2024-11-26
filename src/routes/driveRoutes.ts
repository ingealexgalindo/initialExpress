import { Router } from "express";
import {
  listFiles,
  authorize,
  getFolderStructure,
} from "../controllers/driveController";

const router = Router();

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

export default router;
