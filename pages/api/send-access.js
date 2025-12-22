// pages/api/send-access.js
import nodemailer from "nodemailer";
import { supabaseAdmin } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { externalReference } = req.body;

  if (!externalReference) {
    return res.status(400).json({ error: "externalReference é obrigatório" });
  }

  try {
    // Busca e‑mail no Supabase
    const { data: sale, error } = await supabaseAdmin
      .from("sales")
      .select("email, status")
      .eq("external_reference", externalReference)
      .single();

    if (error || !sale?.email) {
      console.error("Erro ao buscar e‑mail no Supabase:", error);
      return res.status(400).json({ error: "E‑mail não encontrado" });
    }

    if (sale.status !== "approved") {
      return res.status(400).json({ error: "Pagamento ainda não aprovado" });
    }

    // Configuração do transporte SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.gmail.com
      port: parseInt(process.env.SMTP_PORT, 10), // converte para número
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true se porta 465, false se 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envia o e‑mail
    await transporter.sendMail({
      from: `"Suporte Developer 5TB" <${process.env.SMTP_USER}>`,
      to: sale.email,
      subject: "Seu acesso ao material foi liberado 🎉",
      html: `
        <h2>Parabéns, seu pagamento foi aprovado!</h2>
        <p>Segue o link para acessar seu material:</p>
        <p><a href="${process.env.DOWNLOAD_LINK}" target="_blank">Clique aqui para baixar</a></p>
        <p>Obrigado pela confiança 🚀</p>
      `,
    });

    console.log(`E‑mail enviado para ${sale.email}`);

    return res.status(200).json({
      ok: true,
      email: sale.email,
      message: "Pagamento aprovado. E‑mail enviado com sucesso.",
    });
  } catch (err) {
    console.error("Erro no envio manual:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err.message });
  }
}
