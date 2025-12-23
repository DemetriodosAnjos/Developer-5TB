// pages/success.js
import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabaseClient";

export default function SuccessPage() {
  const [status, setStatus] = useState(null);

  const externalReference =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("external_reference")
      : null;

  useEffect(() => {
    const checkStatus = async () => {
      if (!externalReference) return;

      const { data, error } = await supabasePublic
        .from("sales")
        .select("status")
        .eq("external_reference", externalReference)
        .single();

      if (error) {
        console.error("Erro ao consultar Supabase:", error);
        setStatus("error");
        return;
      }

      setStatus(data?.status);
    };

    checkStatus();
  }, [externalReference]);

  if (status === "approved") {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h1 style={{ color: "green" }}>✅ Pagamento confirmado</h1>
        <p>Seu acesso foi liberado. Verifique seu e‑mail.</p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h1 style={{ color: "orange" }}>⏳ Pagamento em processamento</h1>
        <p>Aguarde alguns minutos e tente novamente.</p>
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
