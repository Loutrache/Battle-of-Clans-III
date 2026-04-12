import type { Metadata } from "next";
import "./globals.css";
import { Cinzel, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import HeaderAuthLink from "./components/HeaderAuthLink";
import Link from "next/link";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-great-vibes",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Battle of Clans III",
  description: "Challenge littéraire Battle of Clans III",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${greatVibes.variable} bg-black text-white`}
      >
        <header className="border-b border-white/10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <a
              href="/"
              className="font-cinzel text-sm uppercase tracking-[0.4em] text-[#6163FC]"
            >
              Battle of Clans III
            </a>

            <div className="font-cormorant flex gap-6 text-xl font-medium text-zinc-300">
              <a href="/" className="font-cormorant transition hover:text-white">
                Accueil
              </a>
              <a
                href="/histoire"
                className="font-cormorant transition hover:text-white"
              >
                Histoire
              </a>
              <a
                href="/regles"
                className="font-cormorant transition hover:text-white"
              >
                Règles
              </a>
              <a
                href="/clans"
                className="font-cormorant transition hover:text-white"
              >
                Clans
              </a>
              <a
                href="/defis"
                className="font-cormorant transition hover:text-white"
              >
                Défis
              </a>
              <a
                href="/recommandations-oracles"
                className="font-cormorant transition hover:text-white"
              >
                Recos de la Loutrache
              </a>
               <HeaderAuthLink />
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}