const { google } = require("googleapis");

const { uploadClipboardToDrive } = require("../utils/driveUtil");
const {
  getClipSyncFolderId,
  listTextFilesInFolder,
  downloadTextFile,
} = require("../utils/fileHandlinginGDrive");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require("../config/env");

exports.saveClipboard = async (req) => {
  const filename = `clipboard-${Date.now()}.txt`;

  const driveResult = await uploadClipboardToDrive(
    filename,
    (refresh_token = req.user.driveRefreshToken),
    (content = req.body.text)
  );
  console.log("Drive Result:", driveResult, req.body.text);

  return { filename, driveFileId: driveResult.id };
};

exports.getHistory = async (userId) => {
  // Normally, you'd list files or maintain metadata in DB
  return [{ message: "Get history from Google Drive or metadata DB" }];
};

exports.toggleSync = async (userId, { deviceId, status }) => {
  return { message: "Sync toggling not implemented for Drive yet" };
};

exports.getClipboardHistoryFromDrive = async (req) => {
  try {
    const refresh_token = req.user.driveRefreshToken;
    const pageSize = parseInt(req.query.limit) || 10;
    const pageToken = req.query.pageToken || null;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token });
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const folderId = await getClipSyncFolderId(
      drive,
      (folderName = "ClipSync")
    );
    const files = await listTextFilesInFolder(drive, folderId);

    const clipboardData = [];
    for (const file of files) {
      const content = await downloadTextFile(drive, file.id);
      clipboardData.push(content);
    }

    return clipboardData; // array of { name, content }
  } catch (err) {
    console.error("Error fetching clipboard history from Drive:", err);
    throw new Error("Failed to fetch clipboard history");
  }
  return []; // Fallback if something goes wrong
  // return [{ message: "Get history from Google Drive or metadata DB" }]
};
