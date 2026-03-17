import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppCommunityCard } from "@/components/WhatsAppCommunityCard";
import { InstagramCard } from "@/components/InstagramCard";

export const metadata: Metadata = {
  title: "CS2 Rifas de Skins ",
  description:
    "Participe de rifas de skins de Counter-Strike 2. Escolha sua sorte!",
  icons: [{ rel: "icon", url: "/img_rifa-fotor-20260317152722.png" }],
  openGraph: {
    title: "CS2 Rifas de Skins",
    description:
      "Participe de rifas de skins de Counter-Strike 2. Escolha sua sorte!",
    images: [{ url: "/img_rifa-fotor-20260317152722.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CS2 Rifas de Skins",
    description:
      "Participe de rifas de skins de Counter-Strike 2. Escolha sua sorte!",
    images: ["/img_rifa-fotor-20260317152722.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <WhatsAppCommunityCard />
        <InstagramCard />
        <Footer />
      </body>
    </html>
  );
}
