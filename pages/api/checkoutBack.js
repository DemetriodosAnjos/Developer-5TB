// pages/api/checkoutBack.js
import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const MP_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      return res
        .status(500)
        .json({ error: "MERCADO_PAGO_ACCESS_TOKEN não configurado" });
    }

    const { external_reference, amount, description } = req.body;

    const client = new MercadoPagoConfig({ accessToken: MP_TOKEN });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: description || "Acesso ao conteúdo exclusivo",
            quantity: 1,
            unit_price: amount || 0.48,
            currency_id: "BRL",
          },
        ],
        external_reference, // 🔑 vincula com Supabase
        back_urls: {
          success: "https://developer-5-tb.vercel.app/success",
          failure: "https://developer-5-tb.vercel.app/failure",
          pending: "https://developer-5-tb.vercel.app/pending",
        },
        auto_return: "approved",
        notification_url:
          "https://developer-5-tb.vercel.app/api/payment-webhook",
      },
    });

    return res.status(200).json({ url: response.init_point, id: response.id });
  } catch (err) {
    console.error("Erro no checkout:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
