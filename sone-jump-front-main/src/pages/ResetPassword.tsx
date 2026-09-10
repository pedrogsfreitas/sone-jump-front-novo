import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "../services/api";
import { resetPassword } from "../services/password-reset/password-reset";

/** Mesma regra do cadastro e do back — validar aqui evita uma ida à API à toa. */
const MIN_PASSWORD_LENGTH = 8;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Não foi possível redefinir a senha.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#050505] border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-purple-600 transition-all text-sm placeholder:text-zinc-700";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-widest text-zinc-500";
  const buttonClass =
    "w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs shadow-lg shadow-purple-900/20";

  return (
    <div className="fixed inset-0 z-[999] bg-black text-white flex items-center justify-center px-6">
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[450px]">
        <div className="bg-[#0a0a0a] border border-zinc-900 p-10 md:p-14 rounded-[40px] shadow-2xl">
          {/* Link aberto sem token (colado pela metade, por exemplo): dizer isso é mais
              útil do que deixar a pessoa preencher e só então falhar. */}
          {!token ? (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter">
                Link inválido
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Este endereço não traz um código de redefinição. Peça um novo link para
                continuar.
              </p>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className={buttonClass}
              >
                Pedir novo link
              </button>
            </div>
          ) : done ? (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter">
                Senha redefinida
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Por segurança, todas as sessões abertas foram encerradas. Entre
                novamente com a senha nova.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={buttonClass}
              >
                Ir para o Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold mb-3 uppercase tracking-tighter">
                  Nova Senha
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Escolha uma senha com pelo menos {MIN_PASSWORD_LENGTH} caracteres.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="new-password" className={labelClass}>
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-14`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className={labelClass}>
                    Confirmar senha
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-400 text-xs text-center" role="alert">
                    {errorMessage}
                  </p>
                )}

                <button type="submit" disabled={isLoading} className={buttonClass}>
                  {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
