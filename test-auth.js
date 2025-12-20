// test-auth.js — versão com logs de depuração e google-auth-library
const { google } = require("googleapis");
const { JWT } = require("google-auth-library");
const fs = require("fs");

async function test() {
  try {
    console.log("--- DEBUG START ---");
    console.log(
      "ENV GOOGLE_CLIENT_EMAIL defined:",
      !!process.env.GOOGLE_CLIENT_EMAIL
    );
    console.log(
      "ENV GOOGLE_PRIVATE_KEY defined:",
      !!process.env.GOOGLE_PRIVATE_KEY
    );
    console.log(
      "ENV GOOGLE_APPLICATION_CREDENTIALS:",
      process.env.GOOGLE_APPLICATION_CREDENTIALS || "undefined"
    );
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(
        "sa-temp.json exists:",
        fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      );
    }

    let client;
    if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
      console.log("Branch: ENV key");
      const keyRaw = process.env.GOOGLE_PRIVATE_KEY;
      console.log("ENV PRIVATE_KEY length:", keyRaw.length);
      const key = keyRaw.replace(/\\n/g, "\n");
      console.log(
        "ENV PRIVATE_KEY first 40 chars (showing \\n as literal):",
        key.slice(0, 40).replace(/\n/g, "\\n")
      );

      client = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });
    } else if (
      process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ) {
      console.log("Branch: FILE key");
      const creds = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      console.log("creds.client_email present:", !!creds.client_email);
      console.log("creds.private_key present:", !!creds.private_key);
      const pkPreview = (creds.private_key || "")
        .slice(0, 40)
        .replace(/\n/g, "\\n");
      console.log(
        "creds.private_key first 40 chars (showing \\n as literal):",
        pkPreview
      );
      const privateKey = (creds.private_key || "").replace(/\\n/g, "\n");
      console.log("privateKey length after replace:", privateKey.length);

      client = new JWT({
        email: creds.client_email,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });
    } else {
      console.log("Branch: NONE — no env or file");
      throw new Error(
        "Nenhuma credencial encontrada. Defina GOOGLE_PRIVATE_KEY/GOOGLE_CLIENT_EMAIL ou GOOGLE_APPLICATION_CREDENTIALS"
      );
    }

    console.log("About to request access token with client:", !!client);
    const tokenResponse = await client.authorize();
    console.log("Auth OK, token info keys:", Object.keys(tokenResponse || {}));
    console.log("--- DEBUG END ---");
  } catch (err) {
    console.error("Auth failed:", err.response?.data || err.message || err);
  }
}

test();
