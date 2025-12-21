// pages/api/checkout.js
import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E‑mail é obrigatório" });

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_TOKEN)
      return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado" });

    const client = new MercadoPagoConfig({ accessToken: MP_TOKEN });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "Acesso ao conteúdo exclusivo",
            quantity: 1,
            unit_price: 10,
            currency_id: "BRL",
          },
        ],
        payer: { email },
        back_urls: {
          success: "https://developer-5-tb.vercel.app/sucesso",
          failure: "https://developer-5-tb.vercel.app/erro",
        },
        auto_return: "approved",
        notification_url:
          "https://developer-5-tb.vercel.app/api/payment-webhook",
      },
    });

    return res.status(200).json({ url: response.init_point });
  } catch (err) {
    console.error("Erro no checkout:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
