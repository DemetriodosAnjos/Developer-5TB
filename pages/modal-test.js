import styles from "../styles/Pending.module.css";

export default function ModalTest() {
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
