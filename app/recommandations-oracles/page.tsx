"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type OracleRecommendation = {
  id: number;
  title: string;
  author: string;
  pages: number;
  cover_url: string | null;
  display_order: number | null;
  is_visible: boolean;
};

export default function RecommandationsOraclesPage() {
  const [recommendations, setRecommendations] = useState<OracleRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      const { data, error } = await supabase
        .from("oracle_recommendations")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setRecommendations(data as OracleRecommendation[]);
      }

      setLoading(false);
    }

    loadRecommendations();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-[#0E2028] p-8 shadow-xl">
          <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
            Battle of Clans III
          </p>

          <h1 className="font-great-vibes text-6xl md:text-7xl">
            Recommandations des Oracles
          </h1>

          <p className="font-cormorant mt-4 text-2xl text-white/80">
            Une sélection de lectures conseillées par les Oracles.
          </p>

          {loading ? (
            <p className="font-cormorant mt-10 text-2xl text-white/70">
              Chargement...
            </p>
          ) : recommendations.length === 0 ? (
            <p className="font-cormorant mt-10 text-2xl text-white/70">
              Aucune recommandation disponible pour le moment.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((book) => (
                <div
                  key={book.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  {book.cover_url && (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full rounded-xl object-contain bg-black/20"
                    />
                  )}

                  <h2 className="font-cinzel mt-4 text-xl text-white">
                    {book.title}
                  </h2>

                  <p className="font-cormorant mt-2 text-xl text-white/80">
                    {book.author}
                  </p>

                  <p className="font-cormorant mt-1 text-lg text-white/60">
                    {book.pages} pages
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}