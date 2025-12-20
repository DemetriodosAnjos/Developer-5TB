module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/checkout.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mercadopago__$5b$external$5d$__$28$mercadopago$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mercadopago$29$__ = __turbopack_context__.i("[externals]/mercadopago [external] (mercadopago, cjs, [project]/node_modules/mercadopago)");
;
async function handler(req, res) {
    if (req.method === "POST") {
        try {
            console.log("TOKEN:", process.env.MP_ACCESS_TOKEN);
            const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mercadopago__$5b$external$5d$__$28$mercadopago$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mercadopago$29$__["MercadoPagoConfig"]({
                accessToken: process.env.MP_ACCESS_TOKEN
            });
            const preference = new __TURBOPACK__imported__module__$5b$externals$5d2f$mercadopago__$5b$external$5d$__$28$mercadopago$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mercadopago$29$__["Preference"](client);
            const response = await preference.create({
                body: {
                    items: [
                        {
                            title: "PDF com +5TB de Cursos",
                            unit_price: 19.9,
                            quantity: 1
                        }
                    ],
                    back_urls: {
                        success: "https://unschematically-elective-danyell.ngrok-free.dev/success",
                        failure: "https://unschematically-elective-danyell.ngrok-free.dev/failure",
                        pending: "https://unschematically-elective-danyell.ngrok-free.dev/pending"
                    },
                    auto_return: "approved"
                }
            });
            res.status(200).json({
                url: response.init_point
            });
        } catch (error) {
            console.error("Erro Mercado Pago:", error);
            res.status(500).json({
                error: error.message
            });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1e0ee2c7._.js.map