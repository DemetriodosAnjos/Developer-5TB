// pages/api/payment-webhook.js
// Importa o módulo nodemailer para envio de e-mails
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // ✅ Verifica se o método HTTP é POST (o Mercado Pago envia notificações via POST)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    // ✅ Importa dinamicamente o SDK do Mercado Pago
    const mpModule = await import("mercadopago");
    const { MercadoPagoConfig, Payment } = mpModule;

    // ✅ Inicializa o cliente Mercado Pago com o accessToken da sua conta
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
    const paymentClient = new Payment(client);

    // ✅ Extrai dados do corpo da requisição enviada pelo Mercado Pago
    const { type, data } = req.body || {};
    const paymentId = data?.id;

    console.log("Webhook recebido:", req.body);

    // ✅ Ignora notificações que não sejam do tipo "payment"
    if (type !== "payment") {
      return res.status(200).json({ message: "Webhook ignorado", type });
    }

    // ✅ Intercepta o teste do Mercado Pago (id fictício)
    if (paymentId === "123456") {
      return res.status(200).json({ message: "Webhook de teste recebido" });
    }

    // ✅ Se não houver paymentId, retorna erro
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId não encontrado" });
    }

    let payment;
    try {
      // ✅ Consulta os detalhes do pagamento no Mercado Pago usando o ID recebido
      payment = await paymentClient.get({ id: paymentId });
    } catch (err) {
      console.error("Erro ao consultar pagamento:", err);
      return res.status(500).json({ error: "Falha ao consultar pagamento" });
    }

    console.log("Status do pagamento:", payment?.status);

    // ✅ Fluxo principal: trata diferentes status do pagamento
    if (payment?.status === "approved") {
      // 🔑 Obtém o e-mail do comprador a partir dos dados do Mercado Pago
      const buyerEmail = payment?.payer?.email;
      if (!buyerEmail) {
        return res
          .status(400)
          .json({ error: "Email do comprador não encontrado" });
      }

      console.log("Comprador:", buyerEmail);

      // --- Google Drive ---
      // ✅ Verifica se credenciais do Google estão configuradas
      if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL) {
        throw new Error("Credenciais do Google não configuradas");
      }

      // ✅ Inicializa cliente Google Drive com autenticação JWT
      const { google } = await import("googleapis");
      const { JWT } = await import("google-auth-library");

      const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
      const googleClient = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v3", auth: googleClient });

      // ✅ Cria permissão de leitura para o comprador no arquivo do Drive
      await drive.permissions.create({
        fileId: process.env.DRIVE_FILE_ID,
        requestBody: {
          type: "user",
          role: "reader",
          emailAddress: buyerEmail,
        },
        sendNotificationEmail: true,
      });

      // --- Nodemailer ---
      // ✅ Configura transporte SMTP para envio de e-mail
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // ✅ Envia e-mail para o comprador com link de download
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

      console.log(`Permissão criada e e‑mail enviado para ${buyerEmail}`);

      // ✅ Retorna resposta de sucesso para o Mercado Pago
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
      // ✅ Caso o pagamento esteja pendente ou em processamento
      return res
        .status(200)
        .json({ message: "Pagamento pendente", status: payment?.status });
    } else {
      // ✅ Caso o pagamento tenha sido rejeitado
      return res
        .status(200)
        .json({ message: "Pagamento rejeitado", status: payment?.status });
    }
  } catch (err) {
    // ✅ Tratamento de erros inesperados
    console.error("Erro no webhook:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err.message });
  }
}
