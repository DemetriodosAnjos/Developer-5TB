// pages/pending.js
import { useState, useEffect } from "react";

export default function PendingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#fff", fontSize: "20px" }}>
            ⏳ Confirmando pagamento...
          </p>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            marginTop: "80px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h1 style={{ color: "#f9a825" }}>⏳ Pagamento em análise</h1>
          <h2>Seu pagamento ainda não foi confirmado</h2>
          <p>
            Assim que for aprovado, você receberá o link de acesso em seu
            e‑mail.
          </p>
          <a
            href="https://developer-5-tb.vercel.app"
            style={{ color: "#1976d2" }}
          >
            Voltar à loja
          </a>
        </div>
      )}
    </div>
  );
}
