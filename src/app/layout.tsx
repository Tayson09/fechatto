import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fechatto CRM Imobiliário",
    template: "%s | Fechatto CRM Imobiliário",
  },
  description:
    "Um CRM imobiliário premium, elegante e minimalista para organizar leads, acelerar atendimentos e fechar mais negócios.",
  applicationName: "Fechatto CRM Imobiliário",
  keywords: [
    "CRM imobiliário",
    "Fechatto",
    "gestão de leads",
    "imobiliária",
    "software imobiliário",
  ],
  authors: [{ name: "Fechatto" }],
  creator: "Fechatto",
  metadataBase: new URL("https://fechatto.com"),
  openGraph: {
    title: "Fechatto CRM Imobiliário",
    description:
      "Um CRM imobiliário premium, elegante e minimalista para acelerar vendas e gestão comercial.",
    type: "website",
    locale: "pt_BR",
    siteName: "Fechatto CRM Imobiliário",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fechatto CRM Imobiliário",
    description:
      "Um CRM imobiliário premium, elegante e minimalista para acelerar vendas e gestão comercial.",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
  icons: {
    icon: "/fechatto-favicon.ico",
    shortcut: "/fechatto-favicon.ico",
    apple: "/fechatto-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;


}>) {

  
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}