import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  RefreshCw,
  TrendingUp,
  Laptop,
  Monitor,
  Server,
  BarChart2,
  GitBranch,
  Smartphone,
  Layers,
  Star,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

const TOTAL_STEPS = 6;

function StepDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < currentStep
              ? "w-6 h-2 bg-purple-500"
              : i === currentStep
              ? "w-8 h-2 bg-purple-400"
              : "w-2 h-2 bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

interface OptionCard {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
}

function SelectableCard({
  option,
  selected,
  onSelect,
}: {
  option: OptionCard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center w-full
        ${
          selected
            ? "border-purple-500 bg-purple-500/10 text-white"
            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-purple-400 hover:bg-zinc-800"
        }`}
    >
      <div
        className={`p-3 rounded-xl ${
          selected ? "bg-purple-600/30 text-purple-300" : "bg-zinc-800 text-zinc-400"
        }`}
      >
        {option.icon}
      </div>
      <span className="font-semibold text-sm leading-tight">{option.label}</span>
      {option.sublabel && (
        <span className="text-xs text-zinc-400 leading-tight">{option.sublabel}</span>
      )}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingChecks, setLoadingChecks] = useState<boolean[]>([false, false, false, false]);

  const goalOptions: OptionCard[] = [
    { id: "primeiro-emprego", label: "Primeiro Emprego", sublabel: "Entrar no mercado de tech", icon: <Rocket size={24} /> },
    { id: "transicao", label: "Transição de Carreira", sublabel: "Mudar de área profissional", icon: <RefreshCw size={24} /> },
    { id: "evolucao", label: "Evolução", sublabel: "Crescer na carreira atual", icon: <TrendingUp size={24} /> },
    { id: "freelancer", label: "Freelancer", sublabel: "Trabalhar de forma independente", icon: <Laptop size={24} /> },
  ];

  const areaOptions: OptionCard[] = [
    { id: "frontend", label: "Frontend", icon: <Monitor size={24} /> },
    { id: "backend", label: "Backend", icon: <Server size={24} /> },
    { id: "data-science", label: "Data Science", icon: <BarChart2 size={24} /> },
    { id: "devops", label: "DevOps", icon: <GitBranch size={24} /> },
    { id: "mobile", label: "Mobile", icon: <Smartphone size={24} /> },
    { id: "ux-ui", label: "UX/UI", icon: <Layers size={24} /> },
  ];

  const levelOptions: OptionCard[] = [
    { id: "iniciante", label: "Iniciante", sublabel: "Estou começando do zero", icon: <Star size={24} /> },
    { id: "basico", label: "Básico", sublabel: "Conheço o básico", icon: <Star size={24} /> },
    { id: "experiente", label: "Experiente", sublabel: "Já trabalho na área", icon: <Star size={24} /> },
    { id: "senior", label: "Sênior", sublabel: "Tenho muita experiência", icon: <Trophy size={24} /> },
  ];

  const timeOptions: OptionCard[] = [
    { id: "2-4h", label: "2-4h", sublabel: "por semana", icon: <Clock size={24} /> },
    { id: "5-8h", label: "5-8h", sublabel: "por semana", icon: <Clock size={24} /> },
    { id: "9-15h", label: "9-15h", sublabel: "por semana", icon: <Clock size={24} /> },
    { id: "15h+", label: "15h+", sublabel: "por semana", icon: <Clock size={24} /> },
  ];

  const loadingMessages = [
    "Analisando seu perfil...",
    "Mapeando habilidades...",
    "Criando trilha personalizada...",
    "Configurando metas...",
  ];

  useEffect(() => {
    if (currentStep !== 5) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    loadingMessages.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setLoadingChecks((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 500 + i * 500)
      );
    });

    timers.push(
      setTimeout(() => {
        // No account exists yet at this point — onboarding answers aren't sent
        // anywhere yet (no backend endpoint for them). Send the user to create a
        // real account rather than faking a session into a route that now
        // actually validates the token.
        navigate("/register");
      }, 2800)
    );

    return () => timers.forEach(clearTimeout);
  }, [currentStep]);

  function selectOption(step: number, id: string) {
    setAnswers((prev) => ({ ...prev, [step]: id }));
  }

  function goNext() {
    if (currentStep < TOTAL_STEPS - 1) setCurrentStep((s) => s + 1);
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Step 0 - Welcome */}
        {currentStep === 0 && (
          <div className="flex flex-col items-center text-center gap-8 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Rocket size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-4">
                Bem-vindo ao{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  JUMP
                </span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                Vamos criar sua trilha personalizada para você conquistar sua carreira em tech. Em menos de 2 minutos.
              </p>
            </div>
            <button
              onClick={goNext}
              className="mt-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-lg hover:from-purple-500 hover:to-purple-400 transition-all duration-200 shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95"
            >
              Vamos começar
            </button>
          </div>
        )}

        {/* Steps 1-4 */}
        {currentStep >= 1 && currentStep <= 4 && (
          <div className="flex flex-col gap-6">
            <StepDots currentStep={currentStep} />

            {currentStep === 1 && (
              <>
                <h2 className="text-3xl font-black text-white text-center mb-2">
                  Qual é seu objetivo?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {goalOptions.map((opt) => (
                    <SelectableCard
                      key={opt.id}
                      option={opt}
                      selected={answers[1] === opt.id}
                      onSelect={() => selectOption(1, opt.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-3xl font-black text-white text-center mb-2">
                  Qual área te interessa?
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {areaOptions.map((opt) => (
                    <SelectableCard
                      key={opt.id}
                      option={opt}
                      selected={answers[2] === opt.id}
                      onSelect={() => selectOption(2, opt.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h2 className="text-3xl font-black text-white text-center mb-2">
                  Seu nível atual?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {levelOptions.map((opt) => (
                    <SelectableCard
                      key={opt.id}
                      option={opt}
                      selected={answers[3] === opt.id}
                      onSelect={() => selectOption(3, opt.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <h2 className="text-3xl font-black text-white text-center mb-2">
                  Quanto tempo por semana?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {timeOptions.map((opt) => (
                    <SelectableCard
                      key={opt.id}
                      option={opt}
                      selected={answers[4] === opt.id}
                      onSelect={() => selectOption(4, opt.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 gap-4">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-200 font-medium"
              >
                <ChevronLeft size={18} />
                Voltar
              </button>
              <button
                onClick={goNext}
                disabled={!answers[currentStep]}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-200 ${
                  answers[currentStep]
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/30"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                Continuar
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 - Loading */}
        {currentStep === 5 && (
          <div className="flex flex-col items-center text-center gap-10">
            <div>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-purple-900" />
                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket size={30} className="text-purple-400" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                Gerando seu roadmap...
              </h2>
              <p className="text-zinc-400 text-sm">Isso levará apenas alguns segundos</p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
              {loadingMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    loadingChecks[i]
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      loadingChecks[i]
                        ? "bg-purple-600 text-white"
                        : "border-2 border-zinc-700"
                    }`}
                  >
                    {loadingChecks[i] && <Check size={14} />}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-500 ${
                      loadingChecks[i] ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
