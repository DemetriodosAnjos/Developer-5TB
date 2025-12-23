import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import styles from "../styles/Pending.module.css";
console.log("Styles carregado:", styles);

export default function PendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");

  const externalReference =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("external_reference")
      : "mock-reference";

  // Verifica se o client foi criado corretamente
  if (!supabasePublic) {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <h1 className={styles.title}>Erro de inicialização</h1>
          <p className={styles.textDescribe}>
            Supabase client não foi carregado. Verifique variáveis de ambiente.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "SUPABASE ANON KEY:",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

      if (data?.status) {
        setStatus(data.status);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [externalReference]);

  const handleLiberarAcesso = async () => {
    if (!externalReference) {
      alert("External reference não encontrado na URL");
      return;
    }

    if (status === "approved") {
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
      <div className={styles.modal}>
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
    </div>
  );
}
