// pages/api/payment-webhook.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  // logs de depuração (seguros)
  console.log(
    "DBG: GOOGLE_CLIENT_EMAIL defined:",
    !!process.env.GOOGLE_CLIENT_EMAIL
  );
  console.log(
    "DBG: GOOGLE_PRIVATE_KEY defined:",
    !!process.env.GOOGLE_PRIVATE_KEY
  );
  console.log(
    "DBG: GOOGLE_PRIVATE_KEY length:",
    process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.length
      : "undefined"
  );
  console.log(
    "DBG: GOOGLE_APPLICATION_CREDENTIALS:",
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "undefined"
  );
  console.log("DBG: DRIVE_FILE_ID defined:", !!process.env.DRIVE_FILE_ID);

  try {
    // imports dinâmicos para evitar bundling em produção
    const { google } = await import("googleapis");
    const { JWT } = await import("google-auth-library");
    const mpModule = await import("mercadopago");
    const MercadoPago = mpModule.default ?? mpModule;

    // inicializa Mercado Pago (compatível com diferentes versões do SDK)
    try {
      if (typeof MercadoPago.configure === "function") {
        MercadoPago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
      } else if (MercadoPago?.configurations?.setAccessToken) {
        MercadoPago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);
      } else if (typeof MercadoPago.setAccessToken === "function") {
        MercadoPago.setAccessToken(process.env.MP_ACCESS_TOKEN);
      } else {
        console.warn(
          "SDK do Mercado Pago: método de configuração não encontrado. Continuando sem configurar via SDK."
        );
      }
    } catch (mpErr) {
      console.warn(
        "Falha ao configurar MercadoPago (não crítico):",
        mpErr?.message || mpErr
      );
    }

    // utilitário para criar cliente Google (aceita env ou arquivo)
    const fs = await import("fs");

    // DEBUG ADICIONAL: preview seguro do PEM (não imprime a chave inteira)
    try {
      const pkFromEnv = process.env.GOOGLE_PRIVATE_KEY;
      const pkFromFile =
        process.env.GOOGLE_APPLICATION_CREDENTIALS &&
        fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
          ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS).private_key
          : undefined;
      const pkRaw = pkFromEnv || pkFromFile || undefined;

      if (pkRaw) {
        const preview = pkRaw.slice(0, 160).replace(/\n/g, "\\n");
        console.log("DBG: private_key preview:", preview);
        console.log(
          "DBG: private_key contains ENCRYPTED:",
          preview.includes("ENCRYPTED")
        );
        console.log(
          "DBG: private_key contains BEGIN RSA PRIVATE KEY:",
          preview.includes("BEGIN RSA PRIVATE KEY")
        );
        console.log(
          "DBG: private_key contains BEGIN PRIVATE KEY:",
          preview.includes("BEGIN PRIVATE KEY")
        );
        console.log(
          "DBG: private_key contains literal backslash-n sequences:",
          /\\n/.test(pkRaw)
        );
      } else {
        console.log("DBG: private_key not found in env or file");
      }
    } catch (previewErr) {
      console.warn(
        "DBG: falha ao gerar preview da private_key:",
        previewErr?.message || previewErr
      );
    }

    function createGoogleClient() {
      // 1) usar GOOGLE_PRIVATE_KEY + GOOGLE_CLIENT_EMAIL (mais comum em env)
      if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
        const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
        return new JWT({
          email: process.env.GOOGLE_CLIENT_EMAIL,
          key,
          scopes: ["https://www.googleapis.com/auth/drive"],
        });
      }

      // 2) usar GOOGLE_APPLICATION_CREDENTIALS apontando para JSON
      if (
        process.env.GOOGLE_APPLICATION_CREDENTIALS &&
        fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      ) {
        const creds = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        const key = (creds.private_key || "").replace(/\\n/g, "\n");
        return new JWT({
          email: creds.client_email,
          key,
          scopes: ["https://www.googleapis.com/auth/drive"],
        });
      }

      // nenhum método disponível
      throw new Error(
        "Nenhuma credencial encontrada: defina GOOGLE_PRIVATE_KEY/GOOGLE_CLIENT_EMAIL ou GOOGLE_APPLICATION_CREDENTIALS"
      );
    }

    // criar cliente e autorizar (com tratamento de erro detalhado)
    let googleClient;
    try {
      googleClient = createGoogleClient();
    } catch (createErr) {
      console.error(
        "Auth create client failed:",
        createErr.message || createErr
      );
      return res.status(500).json({
        error: "Auth create client failed",
        details: createErr.message || String(createErr),
      });
    }

    try {
      // authorize() retorna token info; getAccessToken() também é possível
      const tokenInfo = await googleClient.authorize();
      console.log(
        "DBG: Google auth OK, token keys:",
        Object.keys(tokenInfo || {})
      );
    } catch (authErr) {
      console.error(
        "Auth authorize failed:",
        authErr.response?.data || authErr.message || authErr
      );
      return res.status(500).json({
        error: "Auth authorize failed",
        details: authErr.response?.data || authErr.message || String(authErr),
      });
    }

    const drive = google.drive({ version: "v3", auth: googleClient });

    // lógica do webhook
    const { status, payer } = req.body || {};
    if (status !== "approved") {
      return res.status(200).json({ message: "Pagamento não aprovado" });
    }

    const buyerEmail = payer?.email;
    if (!buyerEmail) {
      return res
        .status(400)
        .json({ error: "Email do comprador não encontrado" });
    }

    // criar permissão no Drive
    try {
      await drive.permissions.create({
        fileId: process.env.DRIVE_FILE_ID,
        requestBody: { type: "user", role: "reader", emailAddress: buyerEmail },
        sendNotificationEmail: true,
      });
    } catch (driveErr) {
      console.error(
        "Drive permissions.create failed:",
        driveErr.response?.data || driveErr.message || driveErr
      );
      return res.status(500).json({
        error: "Drive permissions failed",
        details:
          driveErr.response?.data || driveErr.message || String(driveErr),
      });
    }

    return res
      .status(200)
      .json({ ok: true, message: "Acesso liberado ao PDF" });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err?.message || String(err) });
  }
}
