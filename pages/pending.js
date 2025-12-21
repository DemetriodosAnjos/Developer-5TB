// pages/pending.js
export default function PendingPage() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "80px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#f9a825" }}>⏳ Pagamento em análise</h1>
      <h2>Seu pagamento ainda não foi confirmado</h2>
      <p>
        Assim que for aprovado, você receberá o link de acesso em seu e‑mail.
      </p>
      <p>Obrigado pela paciência!</p>
      <a href="https://developer-5-tb.vercel.app" style={{ color: "#1976d2" }}>
        Voltar à loja
      </a>
    </div>
  );
}
