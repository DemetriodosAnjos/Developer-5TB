import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  // Prefer the explicit MP_ACCESS_TOKEN name but fall back to the one pulled from Vercel
  const MP_TOKEN =
    process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;

  // Fail fast if no token is available
  if (!MP_TOKEN) {
    console.error("MP access token is not defined in environment variables");
    return res
      .status(500)
      .json({ error: "Server configuration error: missing payment token" });
  }

  try {
    // Log only presence for debugging (never log the token value)
    console.log("TOKEN_PRESENT:", !!MP_TOKEN);

    const client = new MercadoPagoConfig({
      accessToken: MP_TOKEN,
    });

    const preference = new Preference(client);

    // Use request body if provided, otherwise fall back to a safe default
    const items = (req.body && req.body.items) || [
      { title: "PDF com +5TB de Cursos", unit_price: 19.9, quantity: 1 },
    ];

    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success:
            "https://unschematically-elective-danyell.ngrok-free.dev/success",
          failure:
            "https://unschematically-elective-danyell.ngrok-free.dev/failure",
          pending:
            "https://unschematically-elective-danyell.ngrok-free.dev/pending",
        },
        auto_return: "approved",
      },
    });

    // Some SDK versions return the init point in different shapes; handle both
    const initPoint =
      response?.init_point ||
      response?.body?.init_point ||
      response?.response?.init_point;

    if (!initPoint) {
      console.error("Mercado Pago response missing init_point:", response);
      return res
        .status(502)
        .json({ error: "Payment provider did not return a checkout URL" });
    }

    return res.status(200).json({ url: initPoint });
  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    // Avoid leaking internal details to the client
    return res.status(500).json({ error: "Internal server error" });
  }
}
