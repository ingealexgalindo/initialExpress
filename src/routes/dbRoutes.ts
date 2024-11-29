import express, { Request, Response } from "express";
import {
  getAllFolders,
  getFolderFileStatusLoadedToday,
} from "../controllers/dbControllers";

const router = express.Router();

//get all folders
router.get("/folders", async (req: Request, res: Response) => {
  try {
    const folders = await getAllFolders();
    res.json(folders);
  } catch (err) {
    console.error("Error fetching folders:", err);
    res.status(500).send("Error fetching folders.");
  }
});

//get all folders
router.get(
  "/FolderFileStatusLoadedToday",
  async (req: Request, res: Response) => {
    try {
      const folders = await getFolderFileStatusLoadedToday();
      res.json(folders);
    } catch (err) {
      console.error("Error fetching folders:", err);
      res.status(500).send("Error fetching folders.");
    }
  }
);

export default router;
