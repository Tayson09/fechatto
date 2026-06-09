"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      router.push("/");
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .lr-root { font-family: 'DM Sans', sans-serif; }

        /* LEFT PANEL */
        .lr-left {
          background: #082a54;
        }
        .lr-dots {
          background-image: radial-gradient(circle, rgba(186,147,58,0.09) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .lr-ring1 {
          top: -100px; right: -100px;
          width: 360px; height: 360px;
          border: 1px solid rgba(186,147,58,0.14);
        }
        .lr-ring2 {
          top: -60px; right: -60px;
          width: 280px; height: 280px;
          border: 1px solid rgba(186,147,58,0.07);
        }
        .lr-ring3 {
          bottom: -120px; left: -80px;
          width: 400px; height: 400px;
          border: 1px solid rgba(186,147,58,0.09);
        }
        .lr-hline {
          left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(186,147,58,0.18), transparent);
        }

        /* BRAND */
        .lr-brand-icon {
          border: 1px solid rgba(186,147,58,0.32);
          background: rgba(255,255,255,0.05);
        }
        .lr-brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 42px; font-weight: 600;
          color: #fff; letter-spacing: -1px; line-height: 1;
        }
        .lr-brand-title span { color: #ba933a; }
        .lr-brand-tagline {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 400;
          color: rgba(255,255,255,0.8); line-height: 1.65;
        }
        .lr-brand-tagline em { color: #ba933a; font-style: italic; }
        .lr-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: #ba933a;
        }

        /* FORM */
        .lr-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px; color: #082a54; letter-spacing: -0.5px;
        }
        .lr-input {
          height: 50px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #082a54;
          background: #f8fafc;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .lr-input:focus {
          border-color: #ba933a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(186,147,58,0.1);
          outline: none;
        }
        .lr-input::placeholder { color: #cbd5e1; }

        .lr-btn {
          background: #082a54;
          transition: all 0.2s;
        }
        .lr-btn:hover:not(:disabled) {
          background: #0a356a;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(8,42,84,0.22);
        }
        .lr-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        @keyframes lr-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .lr-dot { animation: lr-dot 1.2s infinite; }
        .lr-dot-2 { animation-delay: 0.2s; }
        .lr-dot-3 { animation-delay: 0.4s; }

        @keyframes lr-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lr-ai-0 { animation: lr-in 0.45s ease both; }
        .lr-ai-1 { animation: lr-in 0.45s 0.08s ease both; }
        .lr-ai-2 { animation: lr-in 0.45s 0.16s ease both; }
        .lr-ai-3 { animation: lr-in 0.45s 0.24s ease both; }
        .lr-ai-4 { animation: lr-in 0.45s 0.32s ease both; }
        .lr-ai-5 { animation: lr-in 0.45s 0.40s ease both; }
      `}</style>

      <main className="lr-root flex min-h-screen bg-white">

        {/* ── LEFT PANEL ─────────────────────────────────── */}
        <div className="lr-left hidden lg:flex w-[420px] min-h-screen relative overflow-hidden flex-col items-center justify-center px-10 flex-shrink-0">
          <div className="lr-dots absolute inset-0" />
          <div className="lr-ring1 absolute rounded-full" />
          <div className="lr-ring2 absolute rounded-full" />
          <div className="lr-ring3 absolute rounded-full" />
          <div className="lr-hline absolute" style={{ top: "14%" }} />
          <div className="lr-hline absolute" style={{ bottom: "17%" }} />

          <div className="relative z-10 text-center">
            {/* Icon */}
            <div className="lr-brand-icon w-[72px] h-[72px] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ba933a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>

            {/* Logo */}
            <Image
              src="/Fechatto-logo.jpg"
              alt="Fechatto"
              width={140}
              height={60}
              priority
              className="mx-auto mb-2 object-contain"
            />
            <p className="text-[10px] font-medium tracking-[4px] uppercase mb-8"
               style={{ color: "rgba(255,255,255,0.32)" }}>
              CRM Imobiliário
            </p>

            <div className="w-7 h-px bg-[#ba933a]/40 mx-auto mb-8" />

            <p className="lr-brand-tagline max-w-[240px] mx-auto">
              Feche mais negócios.<br/>
              <em>Com menos esforço.</em>
            </p>

            {/* Stats */}
            <div className="flex gap-6 mt-10 pt-6" style={{ borderTop: "1px solid rgba(186,147,58,0.12)" }}>
              {[["R$79", "Por mês"], ["∞", "Imóveis"], ["100%", "Web"]].map(([n, l]) => (
                <div key={l} className="text-center">
                  <span className="lr-stat-num block font-semibold">{n}</span>
                  <span className="block text-[9px] tracking-widest uppercase mt-0.5"
                        style={{ color: "rgba(255,255,255,0.32)" }}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-[360px]">

            {/* Header */}
            <div className="mb-8 lr-ai-0">
              <p className="text-[10px] font-semibold tracking-[3px] uppercase mb-2.5" style={{ color: "#ba933a" }}>
                Bem-vindo de volta
              </p>
              <h1 className="lr-form-title font-semibold mb-1.5">Entrar na conta</h1>
              <p className="text-sm text-slate-400">Acesse seu painel de negócios</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="lr-ai-1">
                <label className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#082a54] mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    className="lr-input w-full px-4 pr-10"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#082a54]/30 pointer-events-none">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="lr-ai-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#082a54] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="lr-input w-full px-4 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#082a54]/30 hover:text-[#082a54]/60 transition-opacity"
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Row */}
              <div className="flex items-center justify-between lr-ai-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[#082a54]"/>
                  <span className="text-xs text-slate-500">Lembrar de mim</span>
                </label>
                <button type="button" className="text-xs font-medium text-[#082a54] hover:text-[#ba933a] transition-colors">
                  Esqueci a senha
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormReady}
                className="lr-btn lr-ai-4 w-full h-[50px] rounded-[10px] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`lr-dot${i > 0 ? ` lr-dot-${i + 1}` : ""} block w-[5px] h-[5px] rounded-full bg-white/80`}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    Entrar
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="lr-ai-5 flex items-center gap-3 mt-7">
              <div className="flex-1 h-px bg-slate-100"/>
              <span className="text-[9px] text-slate-300 tracking-widest uppercase">Fechatto · CRM Imobiliário</span>
              <div className="flex-1 h-px bg-slate-100"/>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}