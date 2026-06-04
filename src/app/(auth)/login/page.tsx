"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function FieldIcon({ type }: { type: "email" | "password" }) {
  return type === "email" ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[#082a54]/60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[#082a54]/60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="10" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function FechattoLogo() {
  return (
    <Image
      src="/Fechatto-logo.jpg"
      alt="Fechatto CRM Imobiliário"
      width={200}
      height={200}
      priority
      className="h-40 w-40 object-contain"
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormReady = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0 && !loading,
    [email, password, loading]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#082a54]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="card-premium w-full overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#082a54] via-[#ba933a] to-[#082a54]" />

          <div className="p-8 sm:p-10">
            <div className="mb-1 space-y-3 text-center">
              <div className="flex justify-center">
                <FechattoLogo />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#082a54]">
                  Entrar
                </h1>
                <p className="text-sm leading-6 text-slate-500">
                  Faça login para continuar
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
  <span className="mb-2 block text-sm font-medium text-[#082a54]">
    Email
  </span>

  <div className="relative">
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      autoComplete="email"
      placeholder="seuemail@empresa.com"
      className="
        h-14
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-5
        text-[15px]
        text-[#082a54]
        shadow-sm
        transition-all
        duration-200
        placeholder:text-slate-400
        focus:border-[#ba933a]
        focus:outline-none
        focus:ring-4
        focus:ring-[#ba933a]/10
      "
    />
  </div>
</label>

              <label className="block">
  <span className="mb-2 block text-sm font-medium text-[#082a54]">
    Senha
  </span>

  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    autoComplete="current-password"
    placeholder="Digite sua senha"
    className="
      h-14
      w-full
      rounded-2xl
      border
      border-[#082a54]/10
      bg-white
      px-5
      text-[15px]
      font-medium
      text-[#082a54]
      placeholder:text-slate-400
      shadow-[0_4px_20px_rgba(15,23,42,0.04)]
      transition-all
      duration-200
      focus:border-[#ba933a]/50
      focus:shadow-[0_8px_30px_rgba(186,147,58,0.10)]
      focus:outline-none
    "
  />
</label>

              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-[#082a54]"
                  />
                  Lembrar de mim
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-[#082a54] transition hover:text-[#ba933a]"
                >
                  Esqueci a senha
                </button>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormReady}
                className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#082a54] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(8,42,84,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0a356a] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  {loading ? "Entrando..." : "Entrar"}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </span>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="h-px w-10 bg-[rgba(8,42,84,0.12)]" />
              <span>Fechatto CRM Imobiliário</span>
              <span className="h-px w-10 bg-[rgba(8,42,84,0.12)]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}