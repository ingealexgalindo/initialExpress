import { getDBConnection } from "../conections/db";
import { Folder } from "../models/folder";
import { File } from "../models/file";

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
    console.error("Error to save folder:", error);
    return { success: false, error: "Error internal server" };
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

const saveFiles = async (file: File) => {
  try {
    const db = await getDBConnection();
    await db.execute(
      `
        INSERT IGNORE INTO files (FileName, FileId, ParentFolderId, FileCreatedTime,UserCreated, DateCreated)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        file.FileName,
        file.FileId,
        file.ParentFolderId,
        file.FileCreatedTime,
        file.UserCreated,
        file.DateCreated,
      ]
    );
    await db.end();
    return { success: true, message: "saved" };
  } catch (error) {
    console.error("Error to save file:", error);
    return { success: false, error: "Error internal server" };
  }
};

export { saveFolder, getAllFolders, saveFiles };
