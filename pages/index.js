import React from "react";
import styles from "../styles/Home.module.css"; // importa o CSS Module

export default function Home() {
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
        <p className={styles.priceText}>R$ 1,49</p>
      </div>

      <button
        className={styles.button}
        onClick={() => (window.location.href = "/checkoutFront")}
      >
        Garantir acesso vitalício
      </button>
    </div>
  );
}
