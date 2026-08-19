import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "../services/login/login";
import { claimReferral } from "../services/referrals/referrals";
import { ApiError } from "../services/api";
import { setToken } from "../services/auth-storage";

const PENDING_REFERRAL_KEY = "pendingReferralCode";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Preencha usuário e senha.");
      return;
    }

    try {
      setIsLoading(true);
      const { token } = await login({ username, password });
      setToken(token);

      const pendingRef = localStorage.getItem(PENDING_REFERRAL_KEY);
      if (pendingRef) {
        localStorage.removeItem(PENDING_REFERRAL_KEY);
        // Best-effort: own code, already-claimed, etc. shouldn't block login.
        await claimReferral(pendingRef).catch(() => {});
      }

      navigate("/app/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Erro ao entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-14 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-black to-black" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-900/20 rounded-full blur-[100px]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10">
          <span className="text-2xl font-black tracking-tighter text-white">JUMP</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 text-purple-400 font-semibold text-sm tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
              Plataforma de evolução profissional
            </span>
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] uppercase">
              Construa sua <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
                carreira
              </span>
              <br />
              em tech.
            </h1>
            <p className="text-zinc-400 text-lg max-w-sm leading-relaxed">
              Roadmap personalizado, mentoria real e conexão direta com o mercado.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value: "12k+", label: "Estudantes" },
              { value: "98%", label: "Empregados" },
              { value: "340+", label: "Mentores" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-sm backdrop-blur-sm">
            <p className="text-zinc-300 text-sm leading-relaxed italic">
              "Em 6 meses saí do zero e consegui meu primeiro emprego como dev. O roadmap fez toda a diferença."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-bold">
                M
              </div>
              <div>
                <div className="text-white text-xs font-semibold">Marina Costa</div>
                <div className="text-zinc-500 text-xs">Frontend Dev @ Nubank</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-zinc-600 text-xs">
          © 2026 JUMP. Todos os direitos reservados.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <span className="text-2xl font-black tracking-tighter">JUMP</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2">Bem-vindo de volta</h2>
            <p className="text-zinc-500">
              Não tem conta?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Criar agora
              </button>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Usuário
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="seu_usuario"
                autoComplete="username"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder-zinc-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-zinc-500 hover:text-purple-400 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder-zinc-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-400 text-xs font-semibold text-center -mt-2">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-zinc-600 text-xs mt-8">
            Ao entrar, você concorda com os{" "}
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
              Termos de Uso
            </span>{" "}
            e{" "}
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
              Política de Privacidade
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
