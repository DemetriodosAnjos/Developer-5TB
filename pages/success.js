import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import styles from "../styles/success.module.css";

export default function SuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // controla spinner inicial
  const [status, setStatus] = useState(null); // controla status do supabase

  const externalReference =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("external_reference")
      : null;

  // ⏳ Loading inicial de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // 🔄 Consulta ao Supabase + retry automático
  useEffect(() => {
    if (!loading && externalReference) {
      const checkStatus = async () => {
        try {
          const { data, error } = await supabasePublic
            .from("sales")
            .select("status")
            .eq("external_reference", externalReference)
            .single();

          if (error) {
            console.error("Erro ao consultar Supabase:", error);
            router.push("/failure");
            return;
          }

          if (data?.status === "approved") {
            setStatus("approved");
          } else if (data?.status === "pending") {
            // mantém retry até virar approved
            setStatus("pending");
          } else {
            router.push("/failure");
          }
        } catch (err) {
          console.error("Erro inesperado:", err);
          router.push("/failure");
        }
      };

      checkStatus();
      const interval = setInterval(checkStatus, 5000); // retry a cada 5s
      return () => clearInterval(interval);
    }
  }, [loading, externalReference, router]);

  // 👉 Enquanto loading inicial
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Carregando pagamento...</p>
        </div>
      </div>
    );
  }

  // 👉 Caso aprovado
  if (status === "approved") {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <div className={styles.icon}></div>
          <h1 className={styles.title}>Pagamento confirmado</h1>
          <p className={styles.subtitleText}>Seu acesso foi liberado!</p>
          <p className={styles.textDescribe}>
            Verifique seu e‑mail para instruções de acesso. Obrigado por confiar
            no nosso serviço.
          </p>
        </div>
      </div>
    );
  }

  // 👉 Caso ainda esteja pendente (retry ativo)
  if (status === "pending") {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>
            Aguardando confirmação do pagamento...
          </p>
        </div>
      </div>
    );
  }

  return null; // outros casos redirecionam
}
