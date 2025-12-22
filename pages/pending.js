// pages/pending.js
import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function PendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");

  // Captura external_reference da URL
  const externalReference =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("external_reference")
      : null;

  // Proteção contra variáveis faltando
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("Supabase não configurado corretamente");
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Erro de configuração</h1>
        <p className={styles.textDescribe}>
          Supabase não inicializado. Verifique variáveis de ambiente.
        </p>
      </div>
    );
  }

  // Consulta status sem redirecionar automático
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
        return;
      }

      if (data?.status) {
        setStatus(data.status);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [externalReference]);

  // Função do botão
  const handleLiberarAcesso = async () => {
    if (!externalReference) {
      alert("External reference não encontrado na URL");
      return;
    }

    if (status === "approved") {
      // Dispara e‑mail via API
      await fetch("/api/send-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalReference }),
      });

      router.push("/success");
    } else {
      alert("Pagamento ainda em processamento. Aguarde alguns segundos.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pagamento em processamento ⏳</h1>
      <p className={styles.subtitleText}>
        Status atual: <strong>{status}</strong>
      </p>

      <p className={styles.textDescribe}>
        Assim que o Mercado Pago confirmar o pagamento, você poderá liberar o
        acesso manualmente.
      </p>

      <button
        onClick={handleLiberarAcesso}
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
        Conferir status de pagamento
      </button>
    </div>
  );
}
