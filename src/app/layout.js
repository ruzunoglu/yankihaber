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
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YANKI."
  },
  verification: {
    google: "ir-cZMFjS9Jc97x56vozXIP5EI9_uoRUvBdggO8Xing",
  },
};

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import InstallPrompt from "../components/InstallPrompt";
import BottomNav from "../components/BottomNav";

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        <main className="app-wrapper">
          {children}
        </main>
        <InstallPrompt />
        <BottomNav />
      </body>
    </html>
  );
}
