import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Award } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-zinc-900/60 backdrop-blur-xl bg-black/40">
        <span className="text-xl font-black tracking-tighter">JUMP</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Plataforma</a>
          <a href="#" className="hover:text-white transition-colors">Carreiras</a>
          <a href="#" className="hover:text-white transition-colors">Mentoria</a>
          <a href="#" className="hover:text-white transition-colors">Sobre nós</a>
        </nav>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-zinc-100 transition-all active:scale-95"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center pt-24 pb-20 relative">
        {/* Background glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(168,85,247,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.8) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-5xl space-y-8">
          <span className="inline-block text-purple-400 font-semibold text-sm tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
            Plataforma de evolução profissional em tech
          </span>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.95] text-white">
            Inicie sua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              história
            </span>
          </h1>

          <p className="text-zinc-400 text-xl max-w-xl mx-auto leading-relaxed">
            Roadmap personalizado, mentoria real e conexão direta com o mercado para você chegar onde quer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/register")}
              className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-900/30 transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              Começar agora
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              Explorar carreiras
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 mt-24 w-full max-w-3xl grid grid-cols-3 gap-px bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-800">
          {[
            { icon: Users, value: "12.000+", label: "Estudantes ativos" },
            { icon: TrendingUp, value: "98%", label: "Taxa de emprego" },
            { icon: Award, value: "340+", label: "Mentores disponíveis" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-zinc-900/80 px-8 py-6 flex flex-col items-center gap-2 hover:bg-zinc-900 transition-colors">
              <Icon size={20} className="text-purple-400" />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider text-center">{label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-600 text-xs">
        <span className="font-black text-white text-sm tracking-tighter">JUMP</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Contato</a>
        </div>
        <span>© 2026 JUMP. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}
