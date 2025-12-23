import { useState, useEffect } from "react";
import styles from "../styles/success.module.css";

export default function TestSuccess() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <img className={styles.icon} />

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
