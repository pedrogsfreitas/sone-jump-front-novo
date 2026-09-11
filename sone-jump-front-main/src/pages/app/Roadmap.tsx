import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock,
  BookOpen,
  Compass,
  ClipboardCheck,
} from "lucide-react";
import {
  getRoadmap,
  updateNodeStatus,
  confirmStudy,
  submitNodeQuiz,
  type QuizResult,
  type RoadmapCareer,
  type RoadmapNode,
  type RoadmapNodeStatus,
} from "../../services/roadmap/roadmap";
import { ApiError } from "../../services/api";

const CATEGORY_ORDER = ["FUNDAMENTOS", "CORE", "FRAMEWORKS", "AVANCADO", "CARREIRA"];
const CATEGORY_LABELS: Record<string, string> = {
  FUNDAMENTOS: "Fundamentos",
  CORE: "Core",
  FRAMEWORKS: "Frameworks",
  AVANCADO: "Avançado",
  CARREIRA: "Carreira",
};

function statusIcon(status: RoadmapNodeStatus) {
  if (status === "COMPLETED") return <CheckCircle size={16} className="text-green-400" />;
  if (status === "IN_PROGRESS") return <Circle size={16} className="text-purple-400 animate-pulse" />;
  if (status === "AVAILABLE") return <Circle size={16} className="text-purple-500" />;
  return <Lock size={16} className="text-zinc-600" />;
}

function statusLabel(status: RoadmapNodeStatus) {
  if (status === "COMPLETED") return "Concluído";
  if (status === "IN_PROGRESS") return "Em andamento";
  if (status === "AVAILABLE") return "Disponível";
  return "Bloqueado";
}

function nodeClasses(status: RoadmapNodeStatus, selected: boolean) {
  const base =
    "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all select-none";
  if (selected) return `${base} border-purple-500 bg-purple-500/10 text-white`;
  if (status === "COMPLETED")
    return `${base} border-green-500/40 bg-green-500/5 text-green-300 hover:border-green-400`;
  if (status === "IN_PROGRESS")
    return `${base} border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20`;
  if (status === "AVAILABLE")
    return `${base} border-purple-500/50 bg-transparent text-purple-400 hover:border-purple-400`;
  return `${base} border-zinc-700 bg-zinc-900/50 text-zinc-500`;
}

export default function Roadmap() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"mapa" | "lista">("mapa");
  const [career, setCareer] = useState<RoadmapCareer | null>(null);
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(CATEGORY_ORDER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [confirmingStudy, setConfirmingStudy] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  // Guarda o placar, não só se passou: na reprovação, saber que faltou 1 acerto
  // é a diferença entre revisar um ponto e recomeçar a etapa no escuro.
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Troca a etapa selecionada e já zera o estado do quiz junto, no mesmo
  // clique — em vez de um useEffect reagindo à mudança depois (o React 19
  // avisa contra isso: causa uma renderização extra desnecessária).
  function selectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
    setQuizAnswers({});
    setQuizResult(null);
  }

  useEffect(() => {
    getRoadmap()
      .then((roadmap) => {
        setCareer(roadmap.career);
        setNodes(roadmap.nodes);
        const current =
          roadmap.nodes.find((n) => n.status === "IN_PROGRESS") ?? roadmap.nodes[0];
        setSelectedNodeId(current?.id ?? null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Erro ao carregar roadmap."))
      .finally(() => setLoading(false));
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  const nodesByCategory = (cat: string) => nodes.filter((n) => n.category === cat);

  async function handleAdvance(node: RoadmapNode) {
    const nextStatus = node.status === "AVAILABLE" ? "IN_PROGRESS" : "COMPLETED";
    setActionError("");
    setUpdating(true);
    try {
      const updated = await updateNodeStatus(node.id, nextStatus);
      setCareer(updated.career);
      setNodes(updated.nodes);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Erro ao atualizar etapa.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleConfirmStudy(node: RoadmapNode) {
    setActionError("");
    setConfirmingStudy(true);
    try {
      const updated = await confirmStudy(node.id);
      setCareer(updated.career);
      setNodes(updated.nodes);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Erro ao confirmar estudo.");
    } finally {
      setConfirmingStudy(false);
    }
  }

  async function handleSubmitQuiz(node: RoadmapNode) {
    setActionError("");
    setSubmittingQuiz(true);
    try {
      const resultado = await submitNodeQuiz(node.id, quizAnswers);
      setCareer(resultado.roadmap.career);
      setNodes(resultado.roadmap.nodes);
      setQuizResult(resultado);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Erro ao corrigir o quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#050505] text-zinc-400 p-6">Carregando roadmap...</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-[#050505] text-red-400 p-6">{error}</div>;
  }

  // Cada carreira tem o seu próprio roadmap — sem carreira escolhida não há grafo
  // nenhum para mostrar. Não é erro: é o passo que falta.
  if (!career) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Roadmap</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 max-w-2xl w-full flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Compass size={26} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Escolha uma carreira para começar</h2>
              <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                Cada carreira tem o seu próprio roadmap, com etapas e conteúdos próprios.
                Depois de escolher, sua trilha aparece aqui.
              </p>
            </div>
            <button
              onClick={() => navigate("/app/careers")}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              Ver carreiras disponíveis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Roadmap {career.title}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Trilha completa da carreira {career.title}
          </p>
        </div>
        <button
          onClick={() => navigate("/app/careers")}
          className="shrink-0 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-xl transition-colors"
        >
          Trocar de carreira
        </button>
      </div>

      {actionError && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit mb-6">
        {(
          [
            { key: "mapa", label: "Mapa" },
            { key: "lista", label: "Lista" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-purple-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAP VIEW */}
      {activeTab === "mapa" && (
        <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Node Map */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-y-auto">
            <div className="flex flex-col items-center gap-2">
              {CATEGORY_ORDER.map((cat, catIdx) => (
                <div key={cat} className="flex flex-col items-center w-full">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>

                  <div className="flex gap-3 justify-center flex-wrap relative">
                    {nodesByCategory(cat).map((node) => (
                      <div key={node.id} className="flex flex-col items-center gap-1.5">
                        {node.status === "IN_PROGRESS" && (
                          <div className="flex items-center gap-1 text-xs text-purple-400 whitespace-nowrap">
                            <MapPin size={11} />
                            <span>Você está aqui</span>
                          </div>
                        )}
                        <div
                          className={nodeClasses(node.status, selectedNodeId === node.id)}
                          onClick={() => selectNode(node.id)}
                        >
                          {statusIcon(node.status)}
                          {node.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {catIdx < CATEGORY_ORDER.length - 1 && (
                    <div className="w-px h-8 bg-gradient-to-b from-zinc-700 to-zinc-800 my-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedNode && (
            <div className="w-80 shrink-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-y-auto">
              <div className="flex items-center gap-2 mb-1">
                {statusIcon(selectedNode.status)}
                <h2 className="font-bold text-lg text-white">{selectedNode.name}</h2>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  selectedNode.status === "COMPLETED"
                    ? "border-green-500/40 text-green-400 bg-green-500/10"
                    : selectedNode.status === "IN_PROGRESS"
                    ? "border-purple-500/40 text-purple-400 bg-purple-500/10"
                    : selectedNode.status === "AVAILABLE"
                    ? "border-purple-400/40 text-purple-300 bg-purple-400/5"
                    : "border-zinc-700 text-zinc-500"
                }`}
              >
                {statusLabel(selectedNode.status)}
              </span>

              <p className="text-zinc-400 text-sm mt-4 leading-relaxed">{selectedNode.description}</p>

              <div className="flex items-center gap-2 mt-4 text-zinc-400 text-sm">
                <Clock size={14} />
                <span>~{selectedNode.hours}h estimadas</span>
              </div>

              {selectedNode.resources.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold mb-2">
                    <BookOpen size={14} />
                    Recursos
                  </div>
                  <ul className="space-y-1.5">
                    {selectedNode.resources.map((r) => (
                      <li key={r.label}>
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs text-purple-400 bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-1.5 hover:bg-purple-500/10 transition-colors"
                          >
                            {r.label}
                          </a>
                        ) : (
                          <span className="block text-xs text-purple-400 bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-1.5">
                            {r.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.status === "IN_PROGRESS" && (
                <div className="mt-5 pt-5 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold mb-3">
                    <ClipboardCheck size={14} />
                    Validação da etapa
                  </div>

                  {/* Estudo (autodeclarado, por enquanto) */}
                  <div
                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border mb-3 ${
                      selectedNode.studyConfirmed
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-zinc-700 bg-zinc-800/50"
                    }`}
                  >
                    <span className={`text-xs ${selectedNode.studyConfirmed ? "text-green-400" : "text-zinc-400"}`}>
                      {selectedNode.studyConfirmed ? "✓ Conteúdo estudado" : "Estudei o conteúdo desta etapa"}
                    </span>
                    {!selectedNode.studyConfirmed && (
                      <button
                        onClick={() => handleConfirmStudy(selectedNode)}
                        disabled={confirmingStudy}
                        className="shrink-0 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Marcar
                      </button>
                    )}
                  </div>

                  {/* Quiz de validação */}
                  <div className="p-3 rounded-xl border border-zinc-700 bg-zinc-800/50">
                    {selectedNode.quizPassed ? (
                      <p className="text-xs text-green-400">✓ Quiz concluído</p>
                    ) : (
                      <>
                        {selectedNode.quiz.map((q) => (
                          <div key={q.id} className="mb-3 last:mb-0">
                            <p className="text-xs text-zinc-300 font-medium mb-2">{q.prompt}</p>
                            <div className="flex flex-col gap-1.5">
                              {q.options.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                                    quizAnswers[q.id] === opt.id
                                      ? "border-purple-500 bg-purple-500/10 text-white"
                                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                  }`}
                                >
                                  {opt.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {quizResult && !quizResult.passed && (
                          <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                            <p className="text-xs text-red-300 font-medium">
                              {quizResult.correctCount} de {quizResult.total} corretas —
                              faltaram {quizResult.minimumCorrect - quizResult.correctCount} para
                              passar.
                            </p>
                            <p className="text-xs text-red-400/80 mt-0.5">
                              Revise o conteúdo e tente de novo. São necessários{" "}
                              {quizResult.minimumCorrect} acertos.
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => handleSubmitQuiz(selectedNode)}
                          disabled={submittingQuiz || selectedNode.quiz.some((q) => !quizAnswers[q.id])}
                          className="w-full text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors mt-1"
                        >
                          {submittingQuiz ? "Corrigindo..." : "Responder quiz"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.status === "AVAILABLE" && (
                <button
                  disabled={updating}
                  onClick={() => handleAdvance(selectedNode)}
                  className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Começar
                </button>
              )}
              {selectedNode.status === "IN_PROGRESS" && (
                <button
                  disabled={updating || !selectedNode.studyConfirmed || !selectedNode.quizPassed}
                  onClick={() => handleAdvance(selectedNode)}
                  title={
                    !selectedNode.studyConfirmed || !selectedNode.quizPassed
                      ? "Complete a validação da etapa acima para concluir"
                      : undefined
                  }
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Marcar como concluído
                </button>
              )}
              {selectedNode.status === "COMPLETED" && (
                <button
                  disabled
                  className="mt-6 w-full bg-green-600/20 text-green-400 border border-green-500/30 text-sm font-medium py-2 rounded-xl cursor-default"
                >
                  Concluído
                </button>
              )}
              {selectedNode.status === "LOCKED" && (
                <button
                  disabled
                  className="mt-6 w-full bg-zinc-800 text-zinc-600 text-sm font-medium py-2 rounded-xl cursor-not-allowed"
                >
                  Bloqueado
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {activeTab === "lista" && (
        <div className="space-y-3">
          {CATEGORY_ORDER.map((cat) => {
            const isOpen = openCategories.includes(cat);
            const catNodes = nodesByCategory(cat);
            const completed = catNodes.filter((n) => n.status === "COMPLETED").length;
            return (
              <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
                  onClick={() => toggleCategory(cat)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className="text-xs text-zinc-500">
                      {completed}/{catNodes.length} concluídas
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown size={16} className="text-zinc-400" />
                  ) : (
                    <ChevronRight size={16} className="text-zinc-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-800">
                    {catNodes.map((node, i) => (
                      <div
                        key={node.id}
                        className={`flex items-center justify-between px-5 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer ${
                          i < catNodes.length - 1 ? "border-b border-zinc-800/50" : ""
                        }`}
                        onClick={() => {
                          selectNode(node.id);
                          setActiveTab("mapa");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {statusIcon(node.status)}
                          <span className={node.status === "LOCKED" ? "text-zinc-500 text-sm" : "text-zinc-200 text-sm"}>
                            {node.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600 text-xs flex items-center gap-1">
                            <Clock size={11} />
                            {node.hours}h
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              node.status === "COMPLETED"
                                ? "bg-green-500/10 text-green-400"
                                : node.status === "IN_PROGRESS"
                                ? "bg-purple-500/10 text-purple-400"
                                : node.status === "AVAILABLE"
                                ? "bg-purple-400/10 text-purple-300"
                                : "bg-zinc-800 text-zinc-600"
                            }`}
                          >
                            {statusLabel(node.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
