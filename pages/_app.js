// _app.js ou layout.js (dependendo da versão do Next)
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function App({ Component, pageProps }) {
  return (
    <main className={inter.variable}>
      <Component {...pageProps} />
    </main>
  );
}
