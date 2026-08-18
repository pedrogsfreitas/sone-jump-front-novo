import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[999] bg-black text-white flex items-center justify-center px-6">
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[450px]">
        <div className="bg-[#0a0a0a] border border-zinc-900 p-10 md:p-14 rounded-[40px] shadow-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-3 uppercase tracking-tighter">
              Recuperar Senha
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Insira o e-mail cadastrado e enviaremos as instruções para você
              voltar a dar o seu próximo **JUMP**.
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                E-mail de Cadastro
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-[#050505] border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-purple-600 transition-all text-sm placeholder:text-zinc-700"
              />
            </div>

            <button
              type="button"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs shadow-lg shadow-purple-900/20"
            >
              Enviar Instruções
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                ← Voltar para o Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
