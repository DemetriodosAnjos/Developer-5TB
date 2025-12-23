import { useState, useEffect } from "react";
import { supabasePublic } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import styles from "../styles/failure.module.css";

export default function FailurePage() {
  const [status, setStatus] = useState("loading");
  const router = useRouter();

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
        return;
      }

      if (data?.status === "approved") {
        router.push("/success");
      } else if (data?.status === "pending") {
        router.push("/pending");
      } else if (data?.status === "rejected" || data?.status === "cancelled") {
        setStatus("failure");
      } else {
        setStatus("error");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [router]);

  if (status === "loading") {
    return (
      <div className={styles.loadingOverlay}>
        <p className={styles.loadingText}>⏳ Verificando status...</p>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <h1 className={styles.title}>❌ Ops!</h1>
          <h2 className={styles.subtitleText}>
            Seu pagamento não foi concluído
          </h2>
          <p className={styles.textDescribe}>
            Tente novamente ou escolha outro meio de pagamento.
          </p>
          <a href="/pendente" className={styles.link}>
            Voltar à loja
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <div className={styles.icon}></div>
        <h1 className={styles.title}>Pagamento em processamento</h1>
        <p className={styles.textDescribe}>
          Não foi possível confirmar o status do pagamento.
        </p>
        <a href="/pendente" className={styles.link}>
          Voltar à loja
        </a>
      </div>
    </div>
  );
}
