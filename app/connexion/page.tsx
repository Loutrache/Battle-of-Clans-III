"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  setMessage("Email ou mot de passe incorrect.");
  setLoading(false);
} else {
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (profileData?.role === "oracle") {
    window.location.href = "/mon-espace-oracle";
  } else {
    window.location.href = "/mon-espace";
  }
  setLoading(false);
}
}
async function handleForgotPassword() {
  if (!email) {
    setMessage("Entrez votre email pour réinitialiser votre mot de passe.");
    return;
  }

  setResetLoading(true);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    setMessage("Impossible d’envoyer l’email de réinitialisation.");
    setResetLoading(false);
    return;
  }

  setMessage("Un email de réinitialisation vient d’être envoyé.");
  setResetLoading(false);

  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0E2028] p-8 shadow-xl">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-8 text-6xl md:text-7xl">
          Connexion
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="font-cormorant mb-2 block text-xl">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="font-cormorant w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none transition focus:border-[#6163FC]"
            />
          </div>

          <div>
            <label className="font-cormorant mb-2 block text-xl">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="font-cormorant w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none transition focus:border-[#6163FC]"
            />
          </div>
          <button
  type="button"
  onClick={handleForgotPassword}
  disabled={resetLoading}
  className="font-cormorant mt-2 text-lg text-[#6163FC] transition hover:text-[#7b7dff] disabled:opacity-50"
>
  {resetLoading ? "Envoi..." : "Mot de passe oublié ?"}
</button>
          <button
            type="submit"
            disabled={loading}
            className="font-cormorant rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF] disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {message && (
          <p className="font-cormorant mt-6 text-lg text-white/90">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}