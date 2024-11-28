import { Request, Response } from "express";
import { getDBConnection } from "../conections/db";
import { Folder } from "../models/folder";

const saveFolder = async (folderData: Folder) => {
  try {
    const db = await getDBConnection();
    await db.execute(
      `
        INSERT IGNORE INTO folder (FolderName, FolderId, ParentFolderId, UserCreated, DateCreated)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        folderData.FolderName,
        folderData.FolderId,
        folderData.ParentFolderId,
        folderData.UserCreated,
        folderData.DateCreated,
      ]
    );
    await db.end();
    return { success: true, message: "saved" };
  } catch (error) {
    console.error("Error al guardar la carpeta:", error);
    return { success: false, error: "Error interno del servidor" };
  }
};

const getAllFolders = async (): Promise<Folder[]> => {
  try {
    const db = await getDBConnection();
    const [rows] = await db.query("SELECT * FROM folder");
    return rows as Folder[];
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};

export { saveFolder, getAllFolders };
