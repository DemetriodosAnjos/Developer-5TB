import { useState } from "react";

export default function CheckoutPage() {
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
        body: JSON.stringify({
          items: [
            { title: "Develop +5TB de Cursos", unit_price: 1.49, quantity: 1 },
          ],
          email, // 🔑 envia o e‑mail para o backend se precisar
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Erro ao iniciar checkout:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Finalize seu pagamento</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="email"
          placeholder="Digite seu e‑mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", width: "250px", marginBottom: "10px" }}
        />
        <br />
        <input
          type="email"
          placeholder="Confirme seu e‑mail"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          style={{ padding: "10px", width: "250px" }}
        />
        {!emailsMatch && confirmEmail && (
          <p style={{ color: "red", marginTop: "8px" }}>
            ⚠️ Os e‑mails não coincidem
          </p>
        )}
      </div>

      <button
        onClick={handleCheckout}
        disabled={!emailsMatch || loading}
        style={{
          padding: "12px 24px",
          backgroundColor: emailsMatch ? "#1976d2" : "#aaa",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: emailsMatch ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "⏳ Gerando checkout..." : "Pagar com Pix"}
      </button>
    </div>
  );
}
