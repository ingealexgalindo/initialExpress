import { Request, Response } from "express";
import { getDBConnection } from "../conections/db";
import { Folder } from "../models/folder";

const saveFolder = async (req: Request, res: Response) => {
  const { FolderName, FolderId, ParentFolderId, UserCreated } = req.body;

  if (!FolderName || !FolderId || !UserCreated) {
    return res.status(400).send("Faltan campos obligatorios.");
  }

  try {
    const folder = new Folder(
      FolderName,
      FolderId,
      UserCreated,
      ParentFolderId
    );

    const db = await getDBConnection();
    const query = `
      INSERT INTO folder (FolderName, FolderId, ParentFolderId, UserCreated, DateCreated)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      folder.FolderName,
      folder.FolderId,
      folder.ParentFolderId,
      folder.UserCreated,
      folder.DateCreated,
    ];
    await db.execute(query, values);

    res.status(201).json({ message: "Carpeta guardada exitosamente.", folder });
  } catch (error) {
    console.error("Error al guardar carpeta:", error);
    res.status(500).send("Error interno del servidor.");
  }
};

const getAllFolders = async (req: Request, res: Response) => {
  try {
    const db = await getDBConnection();

    const query = `SELECT * FROM folder`;
    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener carpetas:", error);
    res.status(500).send("Error interno del servidor.");
  }
};

export { saveFolder, getAllFolders };
