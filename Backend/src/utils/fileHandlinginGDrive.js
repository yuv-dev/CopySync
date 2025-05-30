const { google } = require("googleapis");
const stream = require("stream");
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require("../config/env");

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// 🔍 Step 1: Find or create the ClipSync folder
exports.getClipSyncFolderId = async (drive, folderName) => {
  try {
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: "files(id, name)",
    });

    console.log(res.data.files);
    if (res.data.files.length > 0) {
      return res.data.files[0].id;
    }
  } catch (error) {
    throw new Error(`${folderName} folder not found on Google Drive.`);
  }
};

// 📂 Step 2: List .txt files from the folder
exports.listTextFilesInFolder = async (drive, folderId) => {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='text/plain' and trashed=false`,
      fields: "files(id, name)",
    });

    return res.data.files;
  } catch (error) {
    throw new Error("Error listing text files in the folder: " + error.message);
  }
};

//  Step 3: Download file content by file ID
exports.downloadTextFile = async (drive, fileId) => {
  try {
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      let data = "";
      res.data
        .on("data", (chunk) => {
          data += chunk;
        })
        .on("end", () => {
          resolve(data);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  } catch (error) {
    throw new Error("Error downloading text file: " + error.message);
  }
};

