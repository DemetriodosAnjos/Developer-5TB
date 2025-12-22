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

    console.log("Webhook recebido:", req.body);

    if (type !== "payment") {
      return res.status(200).json({ message: "Webhook ignorado", type });
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

    const externalReference = payment?.external_reference;
    console.log(
      "Status do pagamento:",
      payment?.status,
      "Ref:",
      externalReference
    );

    // ✅ Atualiza status no Supabase
    if (externalReference) {
      await supabase
        .from("sales")
        .update({ status: payment?.status })
        .eq("external_reference", externalReference);
      console.log(`Status atualizado no Supabase para ${payment?.status}`);
    }

    if (payment?.status === "approved") {
      const buyerEmail = payment?.payer?.email;
      if (!buyerEmail) {
        return res
          .status(400)
          .json({ error: "Email do comprador não encontrado" });
      }

      // ... (Google Drive + envio de e‑mail como já está no seu código)

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
