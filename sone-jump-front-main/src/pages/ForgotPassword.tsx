import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { ApiError } from "../services/api";
import { requestPasswordReset } from "../services/password-reset/password-reset";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      // Só chega aqui em falha real (rede, limite de tentativas). E-mail inexistente
      // devolve sucesso: a confirmação abaixo é deliberadamente a mesma nos dois casos.
      setErrorMessage(
        error instanceof ApiError ? error.message : "Não foi possível enviar o e-mail.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black text-white flex items-center justify-center px-6">
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[450px]">
        <div className="bg-[#0a0a0a] border border-zinc-900 p-10 md:p-14 rounded-[40px] shadow-2xl">
          {sent ? (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter">
                Verifique seu e-mail
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Se houver uma conta com <span className="text-zinc-300">{email}</span>,
                enviamos um link para redefinir a senha. Ele vale por 30 minutos e só
                pode ser usado uma vez.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs shadow-lg shadow-purple-900/20"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold mb-3 uppercase tracking-tighter">
                  Recuperar Senha
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Insira o e-mail cadastrado e enviaremos as instruções para você
                  voltar a dar o seu próximo JUMP.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="forgot-email"
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                  >
                    E-mail de Cadastro
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#050505] border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-purple-600 transition-all text-sm placeholder:text-zinc-700"
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-400 text-xs text-center" role="alert">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs shadow-lg shadow-purple-900/20"
                >
                  {isLoading ? "Enviando..." : "Enviar Instruções"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
