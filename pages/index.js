import React from "react";
import styles from "../styles/Home.module.css"; // importa o CSS Module

export default function Home() {
  async function handleCheckout() {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Resposta inesperada:", text);
        alert("Erro ao iniciar pagamento");
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redireciona para o checkout
      } else {
        console.error("Erro ao criar preferência:", data.error);
        alert("Erro ao iniciar pagamento");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão com o servidor");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Acesso Liberado</h1>
      <div className={styles.subtitle}>
        <p className={styles.subtitleText}>
          +5TB de Cursos de Programação e IA com certificação
        </p>
      </div>

      <ul className={styles.list}>
        <li>✅+1500 Cursos de Programação</li>
        <li>✅+200 Cursos de Front-End</li>
        <li>✅+150 Cursos de Back-End</li>
        <li>✅+300 Cursos de IA, Cloud e DevOps</li>
        <li>✅+100 Trilhas de Certificação</li>
        <li>✅+150 Cursos de Design e UX</li>
        <li>✅+100 Cursos de Data Science</li>
        <li>✅+100 Cursos de Cibersegurança</li>
      </ul>
      <div className={styles.price}>
        <p className={styles.textDescribe}>Por apenas</p>
        <p className={styles.priceText}>R$ 19,90</p>
      </div>

      <button className={styles.button} onClick={handleCheckout}>
        Garantir acesso vitalício
      </button>
    </div>
  );
}
