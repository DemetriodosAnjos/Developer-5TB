// pages/api/checkoutBack.js
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "../../lib/supabaseClient";

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

    const { name, email, phone, description } = req.body;

    // ✅ Gera referência única
    const external_reference = uuidv4();

    // ✅ Define preço fixo no backend
    const fixedAmount = 0.59;

    // ✅ Salva no Supabase usando o cliente admin
    const { data, error } = await supabaseAdmin
      .from("sales")
      .insert([
        {
          name,
          email,
          phone,
          status: "pending",
          external_reference,
          amount: fixedAmount,
          payment_method: "pix",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return res.status(500).json({ error: "Falha ao salvar no Supabase" });
    }

    console.log("Registro criado no Supabase:", {
      external_reference,
      email,
      id: data?.[0]?.id,
    });

    // ✅ Cria preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: description || "Acesso ao material",
          quantity: 1,
          unit_price: fixedAmount,
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
    };

    const result = await preferenceClient.create({ body: preference });

    return res.status(200).json({ id: result.id });
  } catch (err) {
    console.error("Erro no checkoutBack:", err);
    return res
      .status(500)
      .json({ error: "Erro interno", details: err.message });
  }
}
