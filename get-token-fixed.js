const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function main() {
  const keyPath = path.join(process.cwd(), 'sa-temp.json');
  const raw = fs.readFileSync(keyPath, 'utf8').replace(/^\uFEFF/, ''); // remove BOM
  let creds;
  try {
    creds = JSON.parse(raw);
  } catch (e) {
    console.error('ERR_PARSE_JSON', e.message);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log(token.token || token);
  } catch (err) {
    console.error('ERR_GET_TOKEN', err.message || err);
    process.exit(1);
  }
}

main();