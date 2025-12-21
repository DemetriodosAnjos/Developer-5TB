// pages/failure.js
export default function FailurePage() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "80px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#c62828" }}>❌ Ops!</h1>
      <h2>Seu pagamento não foi concluído</h2>
      <p>Infelizmente houve uma falha na transação.</p>
      <p>Tente novamente ou escolha outro meio de pagamento.</p>
      <a href="https://developer-5-tb.vercel.app" style={{ color: "#1976d2" }}>
        Voltar à loja
      </a>
    </div>
  );
}
