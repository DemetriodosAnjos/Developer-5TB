// pages/api/payment-webhook.js
import nodemailer from "nodemailer";
import { supabase } from "../../lib/supabaseClient";

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

    console.log("Webhook recebido:", JSON.stringify(req.body, null, 2));

    if (type !== "payment") {
      return res.status(200).json({ message: "Webhook ignorado", type });
    }

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId não encontrado" });
    }

    let payment;
    try {
      payment = await paymentClient.get({ id: paymentId });
      console.log("Detalhes do pagamento:", JSON.stringify(payment, null, 2));
    } catch (err) {
      console.error("Erro ao consultar pagamento:", err);
      return res.status(500).json({ error: "Falha ao consultar pagamento" });
    }

    const externalReference = payment?.external_reference;
    console.log(
      "Status do pagamento:",
      payment?.status,
      "ExternalRef:",
      externalReference
    );

    // ✅ Atualiza status no Supabase
    if (externalReference) {
      const { error } = await supabase
        .from("sales")
        .update({ status: payment?.status })
        .eq("external_reference", externalReference);

      if (error) {
        console.error("Erro ao atualizar Supabase:", error);
      } else {
        console.log(`Status atualizado no Supabase para ${payment?.status}`);
      }
    } else {
      console.warn("Webhook recebido sem external_reference");
    }

    // ✅ Tratamento de status
    if (payment?.status === "approved") {
      const buyerEmail = payment?.payer?.email;
      if (!buyerEmail) {
        return res
          .status(400)
          .json({ error: "Email do comprador não encontrado" });
      }

      // Exemplo de envio de e-mail (mantém seu fluxo atual)
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
