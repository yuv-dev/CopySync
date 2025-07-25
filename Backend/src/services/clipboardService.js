const { google } = require("googleapis");
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require("../config/env");

const { uploadClipboardToDrive } = require("../utils/uploadClipboardToDrive");
const {
  getClipSyncFolderId,
  listTextFilesInFolder,
  downloadTextFile,
} = require("../utils/fileHandlinginGDrive");
const { getOrCreateFolder } = require("../utils/getOrCreateDrivefolder");
const { emitClipboardUpdate } = require("../socket");

// store any copied text
exports.saveClipboard = async (req) => {
  try {
    const filename = `clipboard-${Date.now()}.txt`;
    const content = req.body.text;
    const userId = req.user._id;
    const deviceId = req.body.deviceId;
    const createdAt = new Date();
    const driveResult = await uploadClipboardToDrive(
      filename,
      (refresh_token = req.user.driveRefreshToken),
      content,
      deviceId
    );

    // Emit to all other devices
    const socketUserId = userId.toString();
   
    if (content && socketUserId) {
      emitClipboardUpdate(socketUserId, {
        content,
        deviceId,
        createdAt,
        filename,
        fileId: driveResult.id,
      });
    }

    return { filename, driveFileId: driveResult.id };
  } catch (error) {
    console.error("Error saving clipboard:", error);
    throw new Error("Failed to save clipboard");
  }
};

//Get the online stored clipboard history from Google Drive
exports.getClipboardHistoryFromDrive = async (req) => {
  try {
    const refresh_token = req.user.driveRefreshToken;
    const pageSize = parseInt(req.query.limit) || 10;
    let { pageToken, keyword } = req.query;

    // Sanitize pageToken
    if (!pageToken || pageToken === "null" || pageToken === "undefined") {
      pageToken = null;
    }

    // Sanitize keyword
    if (keyword && typeof keyword === "string") {
      keyword = keyword.trim();
    } else {
      keyword = "";
    }

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
    if (!folderId) {
      console.error("ClipSync folder not found or created.");
      getOrCreateFolder(drive, "ClipSync");
      return { clipboardData: [], nextPageToken: null }; // Return empty if folder not
    }
    const listResponse = await listTextFilesInFolder(
      drive,
      folderId,
      pageSize,
      pageToken,
      keyword
    );
    const files = listResponse.files;

    const clipboardData = [];
    for (const file of files) {
      const content = await downloadTextFile(drive, file.id);
      clipboardData.push({
        content,
        fileId: file.id,
        filename: file.name,
        createdAt: file.createdTime,
        deviceId: file.properties.deviceId,
      });
    }

    return {
      clipboardData: clipboardData, //array of clipboard text contents
      nextPageToken: listResponse.nextPageToken || null,
    };
  } catch (err) {
    console.error("Error fetching clipboard history from Drive:", err);
    return { clipboardData: [], nextPageToken: null }; // Fallback if something goes wrong
  }
};
