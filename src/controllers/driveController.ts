import * as fs from "fs/promises";
import * as path from "path";
import { google, drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { authenticate } from "@google-cloud/local-auth";

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
 * Function to get structure from folders an files
 */

async function getFolderStructure(
  authClient: OAuth2Client,
  parentId: string = "root"
): Promise<any> {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    q: `'${parentId}' in parents`, // get files from folder by `parentId`
    fields: "nextPageToken, files(id, name, mimeType,createdTime)",
  });

  const files = res.data.files || [];

  //structure to save files and folders
  let folderStructure: any = [];

  for (const file of files) {
    if (file.mimeType === "application/vnd.google-apps.folder" && file.id) {
      // if is folder and have id valid, get the structure inside this folder  (recursively)
      const subFolderStructure = await getFolderStructure(authClient, file.id); // call recursively
      folderStructure.push({
        folderName: file.name,
        folderId: file.id,
        files: subFolderStructure,
      });
    } else if (file.id) {
      // if it is afile and have a id valid, add to the list
      folderStructure.push({
        fileId: file.id,
        fileName: file.name,
        createdTime: file.createdTime,
      });
    }
  }

  return folderStructure;
}

export { listFiles, authorize, getFolderStructure }; // Exporta authorize también