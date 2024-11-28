import express, { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import {
  listFiles,
  authorize,
  getFolderStructure,
  getFolderStructureByDate,
  getFolderList,
  getListFilesWithParents,
} from "../controllers/driveController";
import { saveFolder } from "../controllers/dbControllers";

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

// Route to get folder structure
router.get("/folder-list", async (req: Request, res: Response) => {
  try {
    const authClient: OAuth2Client = await authorize();
    const folderList = await getFolderList(authClient);
    res.json(folderList);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send("Error getting folder list: " + err.message);
    } else {
      res.status(500).send("Unknown error occurred while getting structure.");
    }
  }
});

// Saved all folders
router.get("/save-folder-list", async (req: Request, res: Response) => {
  try {
    const authClient: OAuth2Client = await authorize();
    const folderList = await getFolderList(authClient);
    const saveResults = [];

    for (const folder of folderList) {
      const result = await saveFolder({
        FolderName: folder.folderName || "",
        FolderId: folder.folderId,
        ParentFolderId: folder.parentFolderId,
        UserCreated: "AUTO_PROCESS",
        DateCreated: new Date(),
      });
      saveResults.push(result);
    }

    res
      .status(200)
      .json({ message: "Folders saved successfully!", results: saveResults });
  } catch (err) {
    console.error("Error saving folder list:", err);
    res.status(500).send("Error saving folder list: ");
  }
});

// get all files with parents
router.get("/all-filesWParents", async (req: Request, res: Response) => {
  try {
    const authClient: OAuth2Client = await authorize();
    const folderList = await getListFilesWithParents(authClient);
    res.json(folderList);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send("Error getting folder list: " + err.message);
    } else {
      res.status(500).send("Unknown error occurred while getting structure.");
    }
  }
});

export default router;
