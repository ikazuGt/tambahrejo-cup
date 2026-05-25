import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tambahrejo Cup 2026",
  description:
    "Jadwal, hasil, klasemen, dan statistik resmi TAMBAHREJO CUP BY ZAY.AGENCY.",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png" },
    ],
  },
  openGraph: {
    title: "Tambahrejo Cup 2026",
    description: "Piala Dandim 0424 — Open Tournament Tambahrejo.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e70011",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <SiteHeader />
        <main className="container-page" style={{ paddingTop: 20, paddingBottom: 24 }}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="container-page footer-row">
            <span>© {new Date().getFullYear()} Tambahrejo Cup</span>
            <span>By Zay.Agency</span>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
