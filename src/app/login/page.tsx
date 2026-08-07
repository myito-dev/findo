"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || email.split("@")[0] } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2l3 7h7l-5.5 4.2L18.5 22 12 17.5 5.5 22l2-8.8L2 9h7z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">Findo</span>
        </div>

        <h1 className="mb-1 text-xl font-bold">{mode === "signin" ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h1>
        <p className="mb-6 text-sm text-ink-secondary">
          {mode === "signin" ? "Entra para ver tus finanzas." : "Un correo y contraseña por persona en la familia."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Tu nombre"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
              required
            />
          )}
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            required
          />

          {error && <p className="text-sm text-negative">{error}</p>}

          <button type="submit" disabled={loading} className="pill w-full bg-accent py-3 text-sm font-semibold text-accent-ink disabled:opacity-60">
            {loading ? "Un momento…" : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-ink-secondary"
        >
          {mode === "signin" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
        </button>
      </div>
    </div>
  );
}
