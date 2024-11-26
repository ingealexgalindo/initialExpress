import * as fs from "fs/promises";
import * as path from "path";
import { google, drive_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { authenticate } from "@google-cloud/local-auth";

// Si modificas estos alcances, elimina el archivo token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];
// El archivo token.json almacena los tokens de acceso y actualización del usuario,
// y se crea automáticamente cuando el flujo de autorización se completa por primera vez.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Lee las credenciales previamente autorizadas desde el archivo guardado.
 *
 * @return {Promise<OAuth2Client | null>}
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
 * Serializa las credenciales a un archivo compatible con GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
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
 * Carga o solicita autorización para llamar a las APIs.
 *
 * @return {Promise<OAuth2Client>}
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
 * Lista los nombres y las IDs de hasta 10 archivos.
 * @param {OAuth2Client} authClient Un cliente OAuth2 autorizado.
 */
async function listFiles(authClient: OAuth2Client): Promise<void> {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    pageSize: 250,
    fields: "nextPageToken, files(id, name)",
  });
  const files = res.data.files;
  if (!files || files.length === 0) {
    console.log("No se encontraron archivos.");
    return;
  }

  console.log("Archivos:");
  files.forEach((file) => {
    console.log(`${file.name} (${file.id})`);
  });
}

authorize().then(listFiles).catch(console.error);
