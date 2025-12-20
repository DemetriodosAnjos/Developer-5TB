const { google } = require('googleapis');
const path = require('path');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'sa-temp.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });
  try {
    const res = await drive.files.get({
      fileId: '1YTgGJKucsA6uZfu7OhcvdKewueS7z0Ce',
      fields: 'id,name,trashed,owners,driveId',
      supportsAllDrives: true
    });
    console.log('OK:', JSON.stringify(res.data));
  } catch (err) {
    console.error('ERR:', err.response?.data || err.message);
    process.exit(1);
  }
}
main();