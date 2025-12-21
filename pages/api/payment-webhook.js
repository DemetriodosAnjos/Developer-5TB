// pages/api/payment-webhook.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const mpModule = await import("mercadopago");
    const { MercadoPagoConfig, Payment } = mpModule;

    // Inicializa cliente Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const paymentClient = new Payment(client);

    // O Mercado Pago envia algo como { action: "payment.created", data: { id: "123456789" } }
    const { type, data } = req.body || {};
    const paymentId = data?.id;

    if (!paymentId) {
      console.error("Webhook sem paymentId:", req.body);
      return res.status(400).json({ error: "paymentId não encontrado" });
    }

    // Consulta o pagamento na API do Mercado Pago
    const payment = await paymentClient.get({ id: paymentId });

    if (payment?.status !== "approved") {
      return res.status(200).json({ message: "Pagamento não aprovado" });
    }

    const buyerEmail = payment?.payer?.email;
    if (!buyerEmail) {
      return res
        .status(400)
        .json({ error: "Email do comprador não encontrado" });
    }

    // --- Google Drive ---
    const { google } = await import("googleapis");
    const { JWT } = await import("google-auth-library");

    const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const googleClient = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth: googleClient });

    // Cria permissão para o comprador
    await drive.permissions.create({
      fileId: process.env.DRIVE_FILE_ID,
      requestBody: {
        type: "user",
        role: "reader",
        emailAddress: buyerEmail,
      },
      sendNotificationEmail: true, // dispara e-mail automático do Google
    });

    return res
      .status(200)
      .json({ ok: true, message: "Acesso liberado ao PDF" });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err.message });
  }
}
