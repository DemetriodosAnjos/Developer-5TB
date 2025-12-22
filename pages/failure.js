// pages/failure.js
import { useState, useEffect } from "react";
import { supabasePublic } from "../lib/supabaseClient";

export default function FailurePage() {
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
      } else if (data?.status === "rejected" || data?.status === "cancelled") {
        setStatus("failure");
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
        }}
      >
        <p style={{ color: "#fff", fontSize: "20px" }}>
          ⏳ Verificando status...
        </p>
      </div>
    );
  }

  if (status === "failure") {
    return (
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
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1 style={{ color: "orange" }}>⚠️ Atenção</h1>
      <p>Não foi possível confirmar o status do pagamento.</p>
    </div>
  );
}
