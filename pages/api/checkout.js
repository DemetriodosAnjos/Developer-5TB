import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log("TOKEN:", process.env.MP_ACCESS_TOKEN);

      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN,
      });

      const preference = new Preference(client);

      const response = await preference.create({
        body: {
          items: [
            {
              title: "PDF com +5TB de Cursos",
              unit_price: 19.9,
              quantity: 1,
            },
          ],
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

      res.status(200).json({ url: response.init_point });
    } catch (error) {
      console.error("Erro Mercado Pago:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
