// pages/checkoutFront.js
import { useState } from "react";

export default function CheckoutFront() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailsMatch = email && confirmEmail && email === confirmEmail;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redireciona para o checkout do Mercado Pago
      } else {
        console.error("Erro ao criar preferência:", data.error);
        alert("Erro ao iniciar pagamento");
      }
    } catch (err) {
      console.error("Erro ao iniciar checkout:", err);
      alert("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Finalize seu pagamento</h2>
      <input
        type="email"
        placeholder="Digite seu e‑mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="email"
        placeholder="Confirme seu e‑mail"
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
      />
      {!emailsMatch && confirmEmail && (
        <p style={{ color: "red" }}>⚠️ Os e‑mails não coincidem</p>
      )}
      <br />
      <button onClick={handleCheckout} disabled={!emailsMatch || loading}>
        {loading ? "⏳ Gerando checkout..." : "Pagar com Pix"}
      </button>
    </div>
  );
}
