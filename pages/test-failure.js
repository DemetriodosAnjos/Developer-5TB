import styles from "../styles/failure.module.css";

export default function TestFailure() {
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>❌ Ops!</h1>
        <h2 className={styles.subtitleText}>Seu pagamento não foi concluído</h2>
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
