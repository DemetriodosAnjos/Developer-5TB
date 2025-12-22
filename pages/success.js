// pages/success.js
import { useState, useEffect } from "react";
import { supabasePublic } from "../lib/supabaseClient";

export default function SuccessPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const externalReference = new URLSearchParams(window.location.search).get(
      "external_reference"
    );

    const checkStatus = async () => {
      if (!externalReference) {
        setStatus("error");
        return;
      }

      const { data, error } = await supabasePublic
        .from("sales")
        .select("status")
        .eq("external_reference", externalReference)
        .single();

      if (error) {
        console.error("Erro ao consultar Supabase:", error);
        setStatus("error");
      } else if (data?.status === "approved") {
        setStatus("approved");
      } else {
        setStatus("pending");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // checa a cada 5s
    return () => clearInterval(interval);
  }, []);

  if (status === "loading" || status === "pending") {
    return (
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
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "20px 40px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            ⏳ Confirmando pagamento...
          </p>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2e7d32",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "80px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 style={{ color: "#2e7d32" }}>🎉 Parabéns!</h1>
        <h2>Seu pagamento foi recebido com sucesso</h2>
        <p>Nós enviamos o link de acesso em seu e‑mail.</p>
        <p>Obrigado, sucesso pra você!</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1 style={{ color: "red" }}>❌ Erro</h1>
      <p>Não foi possível confirmar seu pagamento.</p>
    </div>
  );
}
