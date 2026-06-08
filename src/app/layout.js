import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
});

export const metadata = {
  title: "YANKI. | Premium Haber Platformu",
  description: "En güncel ve doğru haberler. Gündem, ekonomi, spor ve daha fazlası.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        <main className="app-wrapper">
          {children}
        </main>
      </body>
    </html>
  );
}
