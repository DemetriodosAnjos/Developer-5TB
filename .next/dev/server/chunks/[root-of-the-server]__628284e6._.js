module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/payment-webhook.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// pages/api/payment-webhook.js
__turbopack_context__.s([
    "default",
    ()=>handler
]);
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Use POST"
        });
    }
    // logs de depuração (seguros)
    console.log("DBG: GOOGLE_CLIENT_EMAIL defined:", !!process.env.GOOGLE_CLIENT_EMAIL);
    console.log("DBG: GOOGLE_PRIVATE_KEY defined:", !!process.env.GOOGLE_PRIVATE_KEY);
    console.log("DBG: GOOGLE_PRIVATE_KEY length:", process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.length : "undefined");
    console.log("DBG: GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS || "undefined");
    console.log("DBG: DRIVE_FILE_ID defined:", !!process.env.DRIVE_FILE_ID);
    try {
        // imports dinâmicos para evitar bundling em produção
        const { google } = await __turbopack_context__.A("[externals]/googleapis [external] (googleapis, cjs, [project]/node_modules/googleapis, async loader)");
        const { JWT } = await __turbopack_context__.A("[externals]/google-auth-library [external] (google-auth-library, cjs, [project]/node_modules/google-auth-library, async loader)");
        const mpModule = await __turbopack_context__.A("[externals]/mercadopago [external] (mercadopago, cjs, [project]/node_modules/mercadopago, async loader)");
        const MercadoPago = mpModule.default ?? mpModule;
        // inicializa Mercado Pago (compatível com diferentes versões do SDK)
        try {
            if (typeof MercadoPago.configure === "function") {
                MercadoPago.configure({
                    access_token: process.env.MP_ACCESS_TOKEN
                });
            } else if (MercadoPago?.configurations?.setAccessToken) {
                MercadoPago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);
            } else if (typeof MercadoPago.setAccessToken === "function") {
                MercadoPago.setAccessToken(process.env.MP_ACCESS_TOKEN);
            } else {
                console.warn("SDK do Mercado Pago: método de configuração não encontrado. Continuando sem configurar via SDK.");
            }
        } catch (mpErr) {
            console.warn("Falha ao configurar MercadoPago (não crítico):", mpErr?.message || mpErr);
        }
        // utilitário para criar cliente Google (aceita env ou arquivo)
        const fs = await __turbopack_context__.A("[externals]/fs [external] (fs, cjs, async loader)");
        // DEBUG ADICIONAL: preview seguro do PEM (não imprime a chave inteira)
        try {
            const pkFromEnv = process.env.GOOGLE_PRIVATE_KEY;
            const pkFromFile = process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS) ? (()=>{
                const e = new Error("Cannot find module as expression is too dynamic");
                e.code = 'MODULE_NOT_FOUND';
                throw e;
            })().private_key : undefined;
            const pkRaw = pkFromEnv || pkFromFile || undefined;
            if (pkRaw) {
                const preview = pkRaw.slice(0, 160).replace(/\n/g, "\\n");
                console.log("DBG: private_key preview:", preview);
                console.log("DBG: private_key contains ENCRYPTED:", preview.includes("ENCRYPTED"));
                console.log("DBG: private_key contains BEGIN RSA PRIVATE KEY:", preview.includes("BEGIN RSA PRIVATE KEY"));
                console.log("DBG: private_key contains BEGIN PRIVATE KEY:", preview.includes("BEGIN PRIVATE KEY"));
                console.log("DBG: private_key contains literal backslash-n sequences:", /\\n/.test(pkRaw));
            } else {
                console.log("DBG: private_key not found in env or file");
            }
        } catch (previewErr) {
            console.warn("DBG: falha ao gerar preview da private_key:", previewErr?.message || previewErr);
        }
        function createGoogleClient() {
            // 1) usar GOOGLE_PRIVATE_KEY + GOOGLE_CLIENT_EMAIL (mais comum em env)
            if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
                const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
                return new JWT({
                    email: process.env.GOOGLE_CLIENT_EMAIL,
                    key,
                    scopes: [
                        "https://www.googleapis.com/auth/drive"
                    ]
                });
            }
            // 2) usar GOOGLE_APPLICATION_CREDENTIALS apontando para JSON
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
                const creds = (()=>{
                    const e = new Error("Cannot find module as expression is too dynamic");
                    e.code = 'MODULE_NOT_FOUND';
                    throw e;
                })();
                const key = (creds.private_key || "").replace(/\\n/g, "\n");
                return new JWT({
                    email: creds.client_email,
                    key,
                    scopes: [
                        "https://www.googleapis.com/auth/drive"
                    ]
                });
            }
            // nenhum método disponível
            throw new Error("Nenhuma credencial encontrada: defina GOOGLE_PRIVATE_KEY/GOOGLE_CLIENT_EMAIL ou GOOGLE_APPLICATION_CREDENTIALS");
        }
        // criar cliente e autorizar (com tratamento de erro detalhado)
        let googleClient;
        try {
            googleClient = createGoogleClient();
        } catch (createErr) {
            console.error("Auth create client failed:", createErr.message || createErr);
            return res.status(500).json({
                error: "Auth create client failed",
                details: createErr.message || String(createErr)
            });
        }
        try {
            // authorize() retorna token info; getAccessToken() também é possível
            const tokenInfo = await googleClient.authorize();
            console.log("DBG: Google auth OK, token keys:", Object.keys(tokenInfo || {}));
        } catch (authErr) {
            console.error("Auth authorize failed:", authErr.response?.data || authErr.message || authErr);
            return res.status(500).json({
                error: "Auth authorize failed",
                details: authErr.response?.data || authErr.message || String(authErr)
            });
        }
        const drive = google.drive({
            version: "v3",
            auth: googleClient
        });
        // lógica do webhook
        const { status, payer } = req.body || {};
        if (status !== "approved") {
            return res.status(200).json({
                message: "Pagamento não aprovado"
            });
        }
        const buyerEmail = payer?.email;
        if (!buyerEmail) {
            return res.status(400).json({
                error: "Email do comprador não encontrado"
            });
        }
        // criar permissão no Drive
        try {
            await drive.permissions.create({
                fileId: process.env.DRIVE_FILE_ID,
                requestBody: {
                    type: "user",
                    role: "reader",
                    emailAddress: buyerEmail
                },
                sendNotificationEmail: true
            });
        } catch (driveErr) {
            console.error("Drive permissions.create failed:", driveErr.response?.data || driveErr.message || driveErr);
            return res.status(500).json({
                error: "Drive permissions failed",
                details: driveErr.response?.data || driveErr.message || String(driveErr)
            });
        }
        return res.status(200).json({
            ok: true,
            message: "Acesso liberado ao PDF"
        });
    } catch (err) {
        console.error("Erro no webhook:", err);
        return res.status(500).json({
            error: "Erro interno",
            details: err?.message || String(err)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__628284e6._.js.map