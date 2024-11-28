import * as fs from "fs/promises";
import * as path from "path";
import { google, drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { authenticate } from "@google-cloud/local-auth";
import {
  FileStructure,
  FolderStructure,
  FolderInfo,
  FileInfo,
} from "../models/drive";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 */
async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client: OAuth2Client): Promise<void> {
  const content = await fs.readFile(CREDENTIALS_PATH, "utf-8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize(): Promise<OAuth2Client> {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = (await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })) as OAuth2Client;
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 */
async function listFiles(authClient: OAuth2Client): Promise<any> {
  const drive = google.drive({ version: "v3", auth: authClient });

  try {
    const res = await drive.files.list({
      pageSize: 200,
      fields: "nextPageToken, files(id, name)",
    });

    const files = res.data.files;

    if (!files || files.length === 0) {
      return { message: "Files not found." };
    }

    return {
      message: "Found Files",
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
      })),
    };
  } catch (error) {
    return { error: "Error to get files " };
  }
}

/**
 * Function to get all structure from folders an files
 */

async function getFolderStructure(
  authClient: OAuth2Client,
  parentId: string = "root"
): Promise<(FileStructure | FolderStructure)[]> {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    q: `'${parentId}' in parents`, // get files from folder by `parentId`
    fields: "nextPageToken, files(id, name, mimeType,createdTime)",
  });

  const files = res.data.files || [];

  //structure to save files and folders
  let folderStructure: (FileStructure | FolderStructure)[] = [];

  for (const file of files) {
    if (file.mimeType === "application/vnd.google-apps.folder" && file.id) {
      // if is folder and have id valid, get the structure inside this folder  (recursively)
      const subFolderStructure = await getFolderStructure(authClient, file.id); // call recursively
      folderStructure.push({
        folderName: file.name != null ? file.name : "",
        folderId: file.id,
        parentFolderId: parentId,
        files: subFolderStructure,
      });
    } else if (file.id) {
      // if it is afile and have a id valid, add to the list
      folderStructure.push({
        fileId: file.id,
        fileName: file.name != null ? file.name : "",
        createdTime: file.createdTime != null ? file.createdTime : "",
      });
    }
  }

  return folderStructure;
}

/**
 * Function to get folder structure, including only files uploaded today.
 */
async function getFolderStructureByDate(
  authClient: OAuth2Client,
  parentId: string = "root",
  today: string = new Date().toISOString().split("T")[0]
): Promise<(FileStructure | FolderStructure)[]> {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    q: `'${parentId}' in parents`, // get files by  parentId
    fields: "nextPageToken, files(id, name, mimeType, createdTime)",
  });

  const files = res.data.files || [];
  const folderStructure: (FileStructure | FolderStructure)[] = [];

  for (const file of files) {
    if (file.mimeType === "application/vnd.google-apps.folder" && file.id) {
      // get structure subfolders
      const subFolderStructure = await getFolderStructureByDate(
        authClient,
        file.id,
        today
      );

      if (subFolderStructure.length > 0) {
        folderStructure.push({
          folderName: file.name || "",
          folderId: file.id,
          parentFolderId: parentId, //include id from father folder
          files: subFolderStructure,
        });
      }
    } else if (
      file.createdTime &&
      file.createdTime.startsWith(today) // validate files of day
    ) {
      // if it is valid file push in
      folderStructure.push({
        fileId: file.id || "",
        fileName: file.name || "",
        createdTime: file.createdTime,
      });
    }
  }

  // return only folder with files
  return folderStructure.length > 0 ? folderStructure : [];
}

// get all folders
async function getFolderList(
  authClient: OAuth2Client,
  parentId: string = "root"
): Promise<FolderInfo[]> {
  const drive = google.drive({ version: "v3", auth: authClient });

  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
    fields: "files(id, name, mimeType)",
  });

  const folders = res.data.files || [];
  const folderStructure: FolderInfo[] = [];

  for (const folder of folders) {
    const folderData: FolderInfo = {
      folderName: folder.name || null,
      folderId: folder.id || "",
      parentFolderId: parentId || null,
    };

    folderStructure.push(folderData);
    const subFolders = await getFolderList(authClient, folder.id!);
    folderStructure.push(...subFolders);
  }
  return folderStructure;
}

async function getListFilesWithParents(
  authClient: OAuth2Client
): Promise<FileInfo[]> {
  const drive = google.drive({ version: "v3", auth: authClient });
  let files: FileInfo[] = [];
  let nextPageToken: string | undefined;

  try {
    do {
      const response = await drive.files.list({
        fields: "nextPageToken, files(id, name, createdTime, parents)",
        q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
        pageSize: 1000,
        pageToken: nextPageToken,
      });

      // Mapear resultados a FileInfo
      files = files.concat(
        response.data.files?.map((file) => ({
          fileId: file.id!,
          fileName: file.name || null,
          createdTime: file.createdTime || null,
          parentFolderId: file.parents ? file.parents[0] : "",
        })) || []
      );

      // Obtener el siguiente token de página
      nextPageToken = response.data.nextPageToken || "";
    } while (nextPageToken); // Continuar hasta que no haya más páginas

    return files;
  } catch (error) {
    console.error("Error al obtener los archivos de Google Drive:", error);
    throw new Error("Error al obtener los archivos de Google Drive");
  }
}

export {
  listFiles,
  authorize,
  getFolderStructure,
  getFolderStructureByDate,
  getFolderList,
  getListFilesWithParents,
};
