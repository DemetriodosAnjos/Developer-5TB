import React, { useState } from "react";
import styles from "../styles/Home.module.css"; // importa o CSS Module

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleCheckout = async () => {
    if (!email || email.trim() === "") {
      alert("Por favor, digite seu e‑mail antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkoutBack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // ✅ agora envia o e‑mail digitado
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // redireciona para o checkout oficial do Mercado Pago
      } else {
        alert("Erro ao iniciar pagamento");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com servidor");
    } finally {
      setLoading(false);
    }
  };

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

      {/* ✅ Campo para o usuário digitar o e‑mail */}
      <input
        type="email"
        placeholder="Digite seu e‑mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />

      <button
        className={styles.button}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "⏳ Processando..." : "Garantir acesso vitalício"}
      </button>
    </div>
  );
}
