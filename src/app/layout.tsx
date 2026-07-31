import type { Metadata } from "next";
import "./globals.css";

import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "OuzihFacture — Facturation pour Entrepreneurs Africains",
  description:
    "Créez, gérez et suivez vos factures en toute simplicité. Solution de facturation moderne conçue pour les entrepreneurs africains.",
  keywords: ["facturation", "facture", "FCFA", "Afrique", "SaaS", "entrepreneur"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
