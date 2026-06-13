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
  metadataBase: new URL('https://yankihabersitesi.web.app'),
  title: {
    default: "YANKI. | Premium Haber Platformu",
    template: "%s | YANKI."
  },
  description: "En güncel ve doğru haberler. Gündem, ekonomi, spor ve daha fazlası.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YANKI."
  },
  verification: {
    google: "mpK-vZXiBA5DNW2fAYe2_unXgHnugVqYJLMAmlJhDGA",
  },
  openGraph: {
    title: "YANKI. | Premium Haber Platformu",
    description: "En güncel ve doğru haberler. Gündem, ekonomi, spor ve daha fazlası.",
    url: "https://yankihabersitesi.web.app",
    siteName: "YANKI.",
    locale: "tr_TR",
    type: "website",
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
import PushNotificationSetup from "../components/PushNotificationSetup";
import MarketTicker from "../components/MarketTicker";
import Footer from "../components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        <MarketTicker />
        <main className="app-wrapper">
          {children}
        </main>
        <Footer />
        <InstallPrompt />
        <PushNotificationSetup />
        <BottomNav />
      </body>
    </html>
  );
}
