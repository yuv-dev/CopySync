const { Readable } = require("stream");
const { createBrotliDecompress } = require("zlib");

const uploadOrUpdateFile = async (
  drive,
  folderId,
  fileName,
  content,
  deviceId,
  storedFileId = null
) => {
  try {
    const bufferStream = new Readable();
    bufferStream.push(content);
    bufferStream.push(null);

    // Step 1: If file ID is already known (previous upload), update the file
    if (storedFileId) {
      const updateResponse = await drive.files.update({
        fileId: storedFileId,
        media: {
          mimeType: "text/plain",
          body: bufferStream,
        },
      });
      return updateResponse.data;
    }

    // Step 2: Create a new file in the folder
    const createResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: "text/plain",
        properties: {
          deviceId: deviceId || null, // or use a separate deviceId variable if available
        },
      },
      media: {
        mimeType: "text/plain",
        body: bufferStream,
      },
      fields: "id, properties",
    });
    return createResponse.data;
  } catch (err) {
    console.error("Error in uploadOrUpdateFile:", err);
    throw new Error("Failed to upload or update file in Google Drive");
  }
};

module.exports = { uploadOrUpdateFile };
