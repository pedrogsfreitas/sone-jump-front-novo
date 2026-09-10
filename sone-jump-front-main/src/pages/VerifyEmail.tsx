import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "../services/api";
import { verifyEmail } from "../services/email-verification/email-verification";

type Estado = "verificando" | "confirmado" | "falhou" | "sem-token";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [estado, setEstado] = useState<Estado>(token ? "verificando" : "sem-token");
  const [errorMessage, setErrorMessage] = useState("");
  // O React 19 monta o efeito duas vezes em desenvolvimento (StrictMode). Sem esta
  // trava, a segunda chamada usaria um token que a primeira já consumiu — e a tela
  // mostraria "link inválido" logo depois de confirmar com sucesso.
  const jaEnviou = useRef(false);

  useEffect(() => {
    if (!token || jaEnviou.current) return;
    jaEnviou.current = true;

    verifyEmail(token)
      .then(() => setEstado("confirmado"))
      .catch((error) => {
        setErrorMessage(
          error instanceof ApiError ? error.message : "Não foi possível confirmar.",
        );
        setEstado("falhou");
      });
  }, [token]);

  const buttonClass =
    "w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs shadow-lg shadow-purple-900/20";

  const conteudo = {
    verificando: {
      titulo: "Confirmando...",
      texto: "Só um instante enquanto validamos o seu link.",
      acao: null,
    },
    confirmado: {
      titulo: "E-mail confirmado",
      texto:
        "Pronto. Agora conseguimos falar com você — inclusive para recuperar a senha, se precisar.",
      acao: { label: "Ir para a plataforma", to: "/app/dashboard" },
    },
    falhou: {
      titulo: "Link inválido",
      texto:
        errorMessage ||
        "Este link expirou ou já foi usado. Entre na plataforma e peça um novo.",
      acao: { label: "Ir para o Login", to: "/login" },
    },
    "sem-token": {
      titulo: "Link incompleto",
      texto: "Este endereço não traz um código de confirmação. Peça um novo pela plataforma.",
      acao: { label: "Ir para o Login", to: "/login" },
    },
  }[estado];

  return (
    <div className="fixed inset-0 z-[999] bg-black text-white flex items-center justify-center px-6">
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[450px]">
        <div className="bg-[#0a0a0a] border border-zinc-900 p-10 md:p-14 rounded-[40px] shadow-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold uppercase tracking-tighter">
            {conteudo.titulo}
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{conteudo.texto}</p>
          {conteudo.acao && (
            <button
              type="button"
              onClick={() => navigate(conteudo.acao.to)}
              className={buttonClass}
            >
              {conteudo.acao.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
