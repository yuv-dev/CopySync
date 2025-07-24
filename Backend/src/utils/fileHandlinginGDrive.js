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

    if (res.data.files.length > 0) {
      return res.data.files[0].id;
    }
  } catch (error) {
    throw new Error(`${folderName} folder not found on Google Drive.`);
  }
};

// 📂 Step 2: List .txt files from the folder
exports.listTextFilesInFolder = async (
  drive,
  folderId,
  pageSize,
  pageToken,
  keyword
) => {
  try {
    let query = `'${folderId}' in parents and mimeType='text/plain' and trashed=false`;
    if (keyword) {
      query += ` and name contains '${keyword}'`;
    }

    const response = await drive.files.list({
      q: query,
      orderBy: "createdTime desc",
      fields: "files(id, name, properties, createdTime), nextPageToken",
      pageSize,
      pageToken: pageToken || undefined,
    });


    return response.data;
  } catch (error) {
    return {
      files: [],
      nextPageToken: null,
    };
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
