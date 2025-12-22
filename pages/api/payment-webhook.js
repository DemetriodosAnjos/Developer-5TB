// pages/api/payment-webhook.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const mpModule = await import("mercadopago");
    const { MercadoPagoConfig, Payment } = mpModule;

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
    const paymentClient = new Payment(client);

    const { type, data } = req.body || {};
    const paymentId = data?.id;

    console.log("Webhook recebido:", req.body);

    if (type !== "payment") {
      return res.status(200).json({ message: "Webhook ignorado", type });
    }

    if (paymentId === "123456") {
      return res.status(200).json({ message: "Webhook de teste recebido" });
    }

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId não encontrado" });
    }

    let payment;
    try {
      payment = await paymentClient.get({ id: paymentId });
      console.log("Detalhes do pagamento:", payment);
    } catch (err) {
      console.error("Erro ao consultar pagamento:", err);
      return res.status(500).json({ error: "Falha ao consultar pagamento" });
    }

    console.log("Status do pagamento:", payment?.status);

    if (payment?.status === "approved") {
      const buyerEmail = payment?.payer?.email;
      if (!buyerEmail) {
        return res
          .status(400)
          .json({ error: "Email do comprador não encontrado" });
      }

      console.log("Comprador:", buyerEmail);

      if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
        throw new Error("Credenciais do Google não configuradas");
      }

      const { google } = await import("googleapis");
      const { JWT } = await import("google-auth-library");

      const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
      const googleClient = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v3", auth: googleClient });

      try {
        // Tenta criar permissão específica para o e-mail
        await drive.permissions.create({
          fileId: process.env.DRIVE_FILE_ID,
          requestBody: {
            type: "user",
            role: "reader",
            emailAddress: buyerEmail,
          },
          sendNotificationEmail: true,
        });
        console.log(`Permissão criada para ${buyerEmail}`);
      } catch (err) {
        console.error("Erro ao criar permissão específica:", err);
        // Fallback: cria permissão pública
        await drive.permissions.create({
          fileId: process.env.DRIVE_FILE_ID,
          requestBody: {
            type: "anyone",
            role: "reader",
          },
        });
        console.log("Permissão pública criada como fallback");
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Suporte Developer 5TB" <${process.env.SMTP_USER}>`,
        to: buyerEmail,
        subject: "Seu acesso ao material foi liberado 🎉",
        html: `
          <h2>Parabéns, seu pagamento foi aprovado!</h2>
          <p>Segue o link para acessar seu material:</p>
          <p><a href="${process.env.DOWNLOAD_LINK}" target="_blank">Clique aqui para baixar</a></p>
          <p>Obrigado pela confiança e bons estudos 🚀</p>
        `,
      });

      console.log(`E‑mail enviado para ${buyerEmail}`);

      return res.status(200).json({
        ok: true,
        status: "approved",
        email: buyerEmail,
        message: "Pagamento aprovado. Acesso liberado e e‑mail enviado.",
      });
    } else if (
      payment?.status === "pending" ||
      payment?.status === "in_process"
    ) {
      return res
        .status(200)
        .json({ message: "Pagamento pendente", status: payment?.status });
    } else {
      return res
        .status(200)
        .json({ message: "Pagamento rejeitado", status: payment?.status });
    }
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err.message });
  }
}
