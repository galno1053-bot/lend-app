import "./globals.css";
import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import Providers from "./providers";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"]
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Pinjaman Hybrid - App",
  description: "Hybrid Crypto Collateral Loan to IDR"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-hero-gradient">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
