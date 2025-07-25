const { google } = require("googleapis");
const { getOrCreateFolder } = require("./getOrCreateDrivefolder");
const { uploadOrUpdateFile } = require("./uploadOrUpdateFileInDrive");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require("../config/env");

exports.uploadClipboardToDrive = async (
  filename,
  refresh_token,
  content,
  deviceId
) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refresh_token,
    });
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    // Step 1: Get or create folder
    const folderId = await getOrCreateFolder(drive, "ClipSync");
    // Step 2: Get existing fileId from DB or elsewhere (or pass null if first time)
    const existingFileId = null; // Replace with your file tracking logic

    // Step 3: Upload or update the file
    const file = await uploadOrUpdateFile(
      drive,
      folderId,
      filename,
      content,
      deviceId,
      (storedFileId = existingFileId)
    );

    return file;
  } catch (err) {
    console.error("Error uploading to Google Drive:", err);
    throw new Error("Failed to upload to Google Drive");
  }
};
