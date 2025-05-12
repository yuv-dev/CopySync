const { google } = require('googleapis');
const { Readable } = require('stream');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

exports.uploadClipboardToDrive = async (filename, content) => {
  const bufferStream = new Readable();
  bufferStream.push(content);
  bufferStream.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: 'text/plain',
    },
    media: {
      mimeType: 'text/plain',
      body: bufferStream,
    },
  });

  return res.data;
};
