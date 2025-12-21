import styles from "../styles/Home.module.css";

export default function Pendente() {
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
          Assim que o Mercado Pago confirmar o pagamento, você receberá um
          e‑mail com o link de acesso ao conteúdo.
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
    </div>
  );
}
