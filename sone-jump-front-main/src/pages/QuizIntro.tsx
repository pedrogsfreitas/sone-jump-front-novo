import { useNavigate } from "react-router-dom";

export default function QuizIntro() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 flex-grow flex items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <span className="text-purple-500 font-bold tracking-[0.3em] uppercase text-xs">
              Personalização de Carreira
            </span>
            <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter">
              Vamos preparar seu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                próximo salto
              </span>
            </h1>
          </div>

          <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Para criarmos uma trilha de estudos que realmente faça sentido,
            precisamos entender onde você está e para onde quer ir. Levará menos
            de 2 minutos.
          </p>

          <div className="pt-8">
            <button
              onClick={() => navigate("/quiz")}
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-12 py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm shadow-lg shadow-purple-900/40"
            >
              Começar Questionário
            </button>
            <p className="text-zinc-600 text-xs mt-6 uppercase tracking-widest font-bold">
              5 perguntas rápidas • Resultados imediatos
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
