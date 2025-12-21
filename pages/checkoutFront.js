// pages/checkoutFront.js
import { useState } from "react";

export default function CheckoutFront() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePixCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkoutBack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, method: "pix" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar pagamento");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Acesso ao conteúdo exclusivo</h2>
      <p>Preço: R$ 1,49</p>

      <h3>Pagamento via Pix</h3>
      <input
        type="email"
        placeholder="Digite seu e‑mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <button onClick={handlePixCheckout} disabled={loading || !email}>
        {loading ? "⏳ Processando..." : "Pagar com Pix"}
      </button>
    </div>
  );
}
