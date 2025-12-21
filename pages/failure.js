// pages/failure.js
import { useState, useEffect } from "react";

export default function FailurePage() {
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
            ⏳ Verificando status...
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
          <h1 style={{ color: "#c62828" }}>❌ Ops!</h1>
          <h2>Seu pagamento não foi concluído</h2>
          <p>Tente novamente ou escolha outro meio de pagamento.</p>
          <a href="/pendente" style={{ color: "#1976d2" }}>
            Voltar à loja
          </a>
        </div>
      )}
    </div>
  );
}
