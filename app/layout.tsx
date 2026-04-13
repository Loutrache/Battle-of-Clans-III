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
  className={`${cinzel.variable} ${cormorant.variable} ${greatVibes.variable} overflow-x-hidden bg-black text-white`}
>
        <header className="border-b border-white/10">
  <nav className="mx-auto max-w-7xl px-4 py-5 md:px-6">
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-[#6163FC] md:text-sm md:tracking-[0.4em]"
      >
        Battle of Clans III
      </Link>
    </div>

    <div className="mt-4 overflow-x-auto pb-2">
      <div className="font-cormorant flex min-w-max items-center gap-5 pr-4 text-lg font-medium text-zinc-300 md:flex-wrap md:justify-end md:gap-6 md:pr-0 md:text-xl">
        <Link href="/" className="whitespace-nowrap transition hover:text-white">
          Accueil
        </Link>
        <Link href="/histoire" className="whitespace-nowrap transition hover:text-white">
          Histoire
        </Link>
        <Link href="/regles" className="whitespace-nowrap transition hover:text-white">
          Règles
        </Link>
        <Link href="/clans" className="whitespace-nowrap transition hover:text-white">
          Clans
        </Link>
        <Link href="/defis" className="whitespace-nowrap transition hover:text-white">
          Défis
        </Link>
        <Link
          href="/recommandations-oracles"
          className="whitespace-nowrap transition hover:text-white"
        >
          Recos de la Loutrache
        </Link>
        <HeaderAuthLink />
      </div>
    </div>
  </nav>
</header>

        {children}
      </body>
    </html>
  );
}