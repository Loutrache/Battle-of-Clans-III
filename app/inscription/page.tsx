"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function InscriptionPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (!error && data.user) {
  await supabase.from("profiles").insert({
    id: data.user.id,
    email,
    username,
    role: "player",
    clan_confirmed: false,
  })
}

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Compte créé. Vérifie ton email si une confirmation est demandée."
      );
      setEmail("");
      setUsername("");
      setPassword("");
      router.push("/mon-espace");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0E2028] p-8 shadow-xl">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-8 text-6xl md:text-7xl">
          Inscription
        </h1>

        <form onSubmit={handleSignup} className="space-y-6">
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
    Pseudo
  </label>

  <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
    className="font-cormorant w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none"
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
            type="submit"
            disabled={loading}
            className="font-cormorant rounded-full bg-[#6163FC] px-8 py-3 text-xl font-semibold transition hover:bg-[#7B7DFF] disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer un compte"}
          </button>
          <p className="font-cormorant text-center text-lg text-white/70">
  Vous avez déjà un compte ?
</p>

<a
  href="/connexion"
  className="font-cormorant block w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-xl text-white transition hover:bg-white/10"
>
  Se connecter
</a>
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