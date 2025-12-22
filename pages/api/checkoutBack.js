// pages/api/checkoutBack.js
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const mpModule = await import("mercadopago");
    const { MercadoPagoConfig, Preference } = mpModule;

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
    const preferenceClient = new Preference(client);

    const { name, email, phone } = req.body;

    // ✅ Gera referência única
    const external_reference = uuidv4();

    // ✅ Salva no Supabase com email e status pending
    const { error } = await supabase.from("sales").insert({
      name,
      email,
      phone,
      status: "pending",
      external_reference,
      amount: 0.51, // valor alinhado
      payment_method: "pix",
    });

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return res.status(500).json({ error: "Falha ao salvar no Supabase" });
    }

    // ✅ Cria preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: "Acesso ao material",
          quantity: 1,
          unit_price: 0.51,
        },
      ],
      external_reference,
      payer: { email },
      back_urls: {
        success: "https://developer-5-tb.vercel.app/success",
        failure: "https://developer-5-tb.vercel.app/failure",
        pending: "https://developer-5-tb.vercel.app/pending",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [{ id: "credit_card" }, { id: "ticket" }],
        default_payment_method_id: "pix", // força PIX como padrão
      },
    };

    const result = await preferenceClient.create({ body: preference });

    // ✅ Retorna id da preferência para o frontend
    return res.status(200).json({ id: result.id });
  } catch (err) {
    console.error("Erro no checkoutBack:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err.message });
  }
}
