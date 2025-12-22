// pages/pending.js
import { useEffect } from "react";
import { supabasePublic } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function PendingPage() {
  const router = useRouter();

  // Polling automático para redirecionar quando status mudar
  useEffect(() => {
    const externalReference = new URLSearchParams(window.location.search).get(
      "external_reference"
    );

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

      if (data?.status === "approved") {
        router.push("/success");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // Função do botão
  const handleLiberarAcesso = async () => {
    const externalReference = new URLSearchParams(window.location.search).get(
      "external_reference"
    );

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

      router.push("/success");
    } else {
      alert("Pagamento ainda em processamento. Aguarde alguns segundos.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pagamento em processamento ⏳</h1>
      <div className={styles.subtitle}>
        <p className={styles.subtitleText}>
          Seu pagamento via Pix foi iniciado e está sendo processado.
        </p>
      </div>

      <div className={styles.loader}>
        <p className={styles.textDescribe}>
          Assim que o Mercado Pago confirmar o pagamento, você será
          redirecionado automaticamente.
        </p>
      </div>

      <ul className={styles.list}>
        <li>
          ✅ Não feche esta página até concluir o pagamento no app do seu banco.
        </li>
        <li>✅ O processo pode levar alguns segundos.</li>
        <li>✅ Você receberá o e‑mail automaticamente após a aprovação.</li>
      </ul>

      <div className={styles.price}>
        <p className={styles.textDescribe}>Obrigado pela confiança 🚀</p>
      </div>

      {/* Botão manual */}
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
        Liberar acesso Vitalício
      </button>
    </div>
  );
}
