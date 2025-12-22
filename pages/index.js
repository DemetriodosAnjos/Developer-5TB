import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Regex simples para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleCheckout = async () => {
    setLoading(true);

    // Gera external_reference único
    const externalReference = uuidv4();

    // Salva os dados no Supabase
    const { error } = await supabase.from("sales").insert([
      {
        name,
        email,
        phone,
        status: "pending",
        external_reference: externalReference,
        amount: 0.5,
        payment_method: "pix",
      },
    ]);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      setLoading(false);
      return;
    }

    try {
      // Chama a API backend para criar a preferência no Mercado Pago
      const res = await fetch("/api/checkoutBack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_reference: externalReference,
          amount: 0.5,
          description: "Acesso ao conteúdo exclusivo",
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redireciona para o checkout
        window.location.href = data.url;
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
        <p className={styles.priceText}>R$ 0,50</p>
      </div>

      {/* Mini Form */}
      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>Quero receber minha estrutura</h2>
        <p className={styles.formSubtitle}>
          Precisamos dos seus dados para enviar o arquivo de forma segura,
          conforme a LGPD.
        </p>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nome</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Digite o nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={`${styles.input} ${
              email && !emailRegex.test(email) ? styles.inputError : ""
            }`}
            placeholder="Digite o email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {email && !emailRegex.test(email) && (
            <p className={styles.errorText}>Digite um e‑mail válido</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Whatsapp</label>
          <input
            type="tel"
            className={styles.input}
            placeholder="(DDD) x xxxx-xxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Loading fora do botão */}
      {loading && <p className={styles.loadingText}>⏳ Processando...</p>}

      {/* Botão de checkout */}
      <button
        className={styles.button}
        onClick={handleCheckout}
        disabled={loading}
      >
        Garantir acesso vitalício
      </button>
    </div>
  );
}
