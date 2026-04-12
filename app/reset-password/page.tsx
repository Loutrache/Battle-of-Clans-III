"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Mot de passe mis à jour avec succès.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <p className="font-cinzel mb-4 text-sm uppercase tracking-[0.4em] text-[#6163FC]">
          Battle of Clans III
        </p>

        <h1 className="font-great-vibes mb-8 text-center text-5xl">
          Nouveau mot de passe
        </h1>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="mb-2 block font-cormorant text-xl">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6163FC]"
            />
          </div>

          <div>
            <label className="mb-2 block font-cormorant text-xl">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6163FC]"
            />
          </div>

          {message && (
            <p className="font-cormorant text-lg text-[#8F92FF]">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-cormorant w-full rounded-full bg-[#6163FC] px-6 py-3 text-xl transition hover:bg-[#7A7DFF]"
          >
            {loading ? "Modification..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}