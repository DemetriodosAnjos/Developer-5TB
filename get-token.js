// get-token.js
const { google } = require("googleapis");
const path = require("path");

async function main() {
  const keyFile = path.join(process.cwd(), "sa-temp.json");
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  console.log(token.token || token);
}

main().catch((err) => {
  console.error("ERR:", err.message || err);
  process.exit(1);
});
