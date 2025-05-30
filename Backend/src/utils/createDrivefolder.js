const getOrCreateFolder = async (drive, folderName) => {
  try {
    // Step 1: Check if folder exists
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Step 2: Create folder if it doesn't exist
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    return folder.data.id;
  } catch (err) {
    console.error("Error in getOrCreateFolder:", err);
    throw new Error("Failed to get or create folder in Google Drive");
  }
};

module.exports = { getOrCreateFolder };
