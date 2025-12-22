// components/LiberarAcessoButton.js
import { supabasePublic } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function LiberarAcessoButton({ externalReference }) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      // Consulta status no Supabase
      const { data, error } = await supabasePublic
        .from("sales")
        .select("status")
        .eq("external_reference", externalReference)
        .single();

      if (error) {
        console.error("Erro ao consultar Supabase:", error);
        return;
      }

      if (data?.status === "approved") {
        // Dispara e‑mail via API
        await fetch("/api/send-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ externalReference }),
        });

        // Redireciona para success
        router.push("/success");
      } else {
        // Redireciona para pending
        router.push(`/pending?external_reference=${externalReference}`);
      }
    } catch (err) {
      console.error("Erro no botão Liberar Acesso:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: "#1976d2",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "20px",
      }}
    >
      Liberar acesso Vitalício
    </button>
  );
}
