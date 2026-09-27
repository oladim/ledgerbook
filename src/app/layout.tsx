import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Sprite } from "@/components/sprite";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledgerbook — Invoices & Receipts",
  description: "Create branded invoices and receipts your customers can pay.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <Sprite />
        {children}
      </body>
    </html>
  );
}
