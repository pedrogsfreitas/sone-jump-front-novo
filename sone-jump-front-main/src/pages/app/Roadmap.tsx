import { useState } from "react";
import {
  CheckCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronRight,
  Download,
  MapPin,
  Clock,
  BookOpen,
} from "lucide-react";

type NodeStatus = "completed" | "in-progress" | "available" | "locked";

interface SkillNode {
  id: string;
  name: string;
  status: NodeStatus;
  category: string;
  hours: number;
  description: string;
  resources: string[];
}

const NODES: SkillNode[] = [
  {
    id: "html-css",
    name: "HTML/CSS",
    status: "completed",
    category: "Fundamentos",
    hours: 40,
    description:
      "Fundação da web. Aprenda a estruturar páginas com HTML semântico e estilizar com CSS moderno.",
    resources: ["MDN Web Docs", "CSS Tricks", "Curso Alura HTML/CSS"],
  },
  {
    id: "responsividade",
    name: "Responsividade",
    status: "completed",
    category: "Fundamentos",
    hours: 20,
    description:
      "Crie layouts que funcionam em qualquer tamanho de tela com Flexbox, Grid e media queries.",
    resources: ["Flexbox Froggy", "Grid Garden", "Rocketseat Discover"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    status: "in-progress",
    category: "Core",
    hours: 80,
    description:
      "A linguagem da web. Domine lógica, manipulação de DOM, eventos e ES6+.",
    resources: ["JavaScript.info", "Eloquent JavaScript", "DIO Bootcamp JS"],
  },
  {
    id: "git",
    name: "Git/GitHub",
    status: "available",
    category: "Core",
    hours: 15,
    description:
      "Controle de versão indispensável. Aprenda commits, branches, pull requests e fluxos de trabalho.",
    resources: ["Pro Git Book", "GitHub Learning Lab", "Curso DIO Git"],
  },
  {
    id: "react",
    name: "React",
    status: "locked",
    category: "Frameworks",
    hours: 60,
    description:
      "Biblioteca para interfaces reativas. Componentes, hooks, estado e ecossistema React.",
    resources: ["React Docs Beta", "Rocketseat Ignite", "Udemy React"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    status: "locked",
    category: "Frameworks",
    hours: 30,
    description:
      "JavaScript com tipagem estática. Reduza bugs e melhore a legibilidade do código.",
    resources: ["TypeScript Handbook", "Total TypeScript", "Alura TypeScript"],
  },
  {
    id: "nextjs",
    name: "Next.js",
    status: "locked",
    category: "Avançado",
    hours: 40,
    description:
      "Framework React para produção. SSR, SSG, API Routes e App Router.",
    resources: ["Next.js Docs", "Vercel Blog", "Rocketseat Next.js"],
  },
  {
    id: "nodejs",
    name: "Node.js",
    status: "locked",
    category: "Avançado",
    hours: 50,
    description:
      "JavaScript no servidor. Construa APIs REST, autenticação e integração com bancos de dados.",
    resources: ["Node.js Docs", "Fastify Guide", "DIO Node Bootcamp"],
  },
  {
    id: "portfolio",
    name: "Portfólio",
    status: "locked",
    category: "Carreira",
    hours: 20,
    description:
      "Construa um portfólio profissional que destaque seus projetos e habilidades para recrutadores.",
    resources: ["GitHub Pages", "Vercel Deploy", "Behance Referências"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    status: "locked",
    category: "Carreira",
    hours: 10,
    description:
      "Otimize seu perfil, construa sua rede e atraia oportunidades na maior rede profissional.",
    resources: ["LinkedIn Learning", "Guia Sone Jump LinkedIn"],
  },
  {
    id: "entrevistas",
    name: "Entrevistas",
    status: "locked",
    category: "Carreira",
    hours: 25,
    description:
      "Prepare-se para entrevistas técnicas: algoritmos, whiteboard coding e soft skills.",
    resources: ["LeetCode", "Frontend Interview Handbook", "Pramp"],
  },
];

const CATEGORIES = [
  "Fundamentos",
  "Core",
  "Frameworks",
  "Avançado",
  "Carreira",
];

const TIMELINE_MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const TIMELINE_ITEMS = [
  { node: "HTML/CSS", month: 0, status: "completed" },
  { node: "Responsividade", month: 1, status: "completed" },
  { node: "JavaScript", month: 2, status: "in-progress" },
  { node: "Git/GitHub", month: 3, status: "available" },
  { node: "React", month: 5, status: "locked" },
  { node: "TypeScript", month: 6, status: "locked" },
  { node: "Next.js", month: 8, status: "locked" },
  { node: "Node.js", month: 9, status: "locked" },
  { node: "Portfólio", month: 10, status: "locked" },
  { node: "Entrevistas", month: 11, status: "locked" },
];

function statusIcon(status: NodeStatus) {
  if (status === "completed")
    return <CheckCircle size={16} className="text-green-400" />;
  if (status === "in-progress")
    return <Circle size={16} className="text-purple-400 animate-pulse" />;
  if (status === "available")
    return <Circle size={16} className="text-purple-500" />;
  return <Lock size={16} className="text-zinc-600" />;
}

function nodeClasses(status: NodeStatus, selected: boolean) {
  const base =
    "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all select-none";
  if (selected) return `${base} border-purple-500 bg-purple-500/10 text-white`;
  if (status === "completed")
    return `${base} border-green-500/40 bg-green-500/5 text-green-300 hover:border-green-400`;
  if (status === "in-progress")
    return `${base} border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20`;
  if (status === "available")
    return `${base} border-purple-500/50 bg-transparent text-purple-400 hover:border-purple-400`;
  return `${base} border-zinc-700 bg-zinc-900/50 text-zinc-500`;
}

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState<"mapa" | "timeline" | "lista">(
    "mapa"
  );
  const [selectedNode, setSelectedNode] = useState<SkillNode>(NODES[2]);
  const [openCategories, setOpenCategories] = useState<string[]>(CATEGORIES);

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const nodesByCategory = (cat: string) =>
    NODES.filter((n) => n.category === cat);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Roadmap Frontend</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Trilha completa para se tornar um dev frontend
          </p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Download size={15} />
          Exportar PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit mb-6">
        {(
          [
            { key: "mapa", label: "Mapa" },
            { key: "timeline", label: "Linha do Tempo" },
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
              {CATEGORIES.map((cat, catIdx) => (
                <div key={cat} className="flex flex-col items-center w-full">
                  {/* Category label */}
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    {cat}
                  </span>

                  {/* Nodes in category */}
                  <div className="flex gap-3 justify-center flex-wrap relative">
                    {nodesByCategory(cat).map((node) => (
                      <div key={node.id} className="relative">
                        {node.status === "in-progress" && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-purple-400 whitespace-nowrap">
                            <MapPin size={11} />
                            <span>Você está aqui</span>
                          </div>
                        )}
                        <div
                          className={nodeClasses(
                            node.status,
                            selectedNode.id === node.id
                          )}
                          onClick={() => setSelectedNode(node)}
                        >
                          {statusIcon(node.status)}
                          {node.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connector line */}
                  {catIdx < CATEGORIES.length - 1 && (
                    <div className="w-px h-8 bg-gradient-to-b from-zinc-700 to-zinc-800 my-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="w-80 shrink-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-y-auto">
            <div className="flex items-center gap-2 mb-1">
              {statusIcon(selectedNode.status)}
              <h2 className="font-bold text-lg text-white">
                {selectedNode.name}
              </h2>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                selectedNode.status === "completed"
                  ? "border-green-500/40 text-green-400 bg-green-500/10"
                  : selectedNode.status === "in-progress"
                  ? "border-purple-500/40 text-purple-400 bg-purple-500/10"
                  : selectedNode.status === "available"
                  ? "border-purple-400/40 text-purple-300 bg-purple-400/5"
                  : "border-zinc-700 text-zinc-500"
              }`}
            >
              {selectedNode.status === "completed"
                ? "Concluído"
                : selectedNode.status === "in-progress"
                ? "Em andamento"
                : selectedNode.status === "available"
                ? "Disponível"
                : "Bloqueado"}
            </span>

            <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
              {selectedNode.description}
            </p>

            <div className="flex items-center gap-2 mt-4 text-zinc-400 text-sm">
              <Clock size={14} />
              <span>~{selectedNode.hours}h estimadas</span>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold mb-2">
                <BookOpen size={14} />
                Recursos
              </div>
              <ul className="space-y-1.5">
                {selectedNode.resources.map((r) => (
                  <li
                    key={r}
                    className="text-xs text-purple-400 bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-1.5 hover:bg-purple-500/10 cursor-pointer transition-colors"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {selectedNode.status !== "locked" && (
              <button className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-xl transition-colors">
                {selectedNode.status === "completed"
                  ? "Revisar"
                  : "Continuar Aprendendo"}
              </button>
            )}
            {selectedNode.status === "locked" && (
              <button
                disabled
                className="mt-6 w-full bg-zinc-800 text-zinc-600 text-sm font-medium py-2 rounded-xl cursor-not-allowed"
              >
                Bloqueado
              </button>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {activeTab === "timeline" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-x-auto">
          <p className="text-zinc-400 text-sm mb-6">
            Plano de estudos para 12 meses
          </p>
          <div className="min-w-[900px]">
            {/* Month headers */}
            <div className="flex mb-3">
              {TIMELINE_MONTHS.map((m) => (
                <div
                  key={m}
                  className="flex-1 text-center text-xs text-zinc-500 font-semibold"
                >
                  {m}
                </div>
              ))}
            </div>
            {/* Timeline bar */}
            <div className="relative h-2 bg-zinc-800 rounded-full mb-8">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-purple-500 to-zinc-700 rounded-full"
                style={{ width: "30%" }}
              />
              {/* Today marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 border-2 border-purple-300 rounded-full"
                style={{ left: "25%" }}
              />
            </div>
            {/* Skill markers */}
            <div className="relative h-64">
              {TIMELINE_ITEMS.map((item, idx) => {
                const left = (item.month / 11) * 100;
                const top = (idx % 4) * 56;
                return (
                  <div
                    key={item.node}
                    className="absolute"
                    style={{ left: `${left}%`, top }}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap ${
                        item.status === "completed"
                          ? "border-green-500/50 bg-green-500/10 text-green-300"
                          : item.status === "in-progress"
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : item.status === "available"
                          ? "border-purple-400/40 bg-purple-400/5 text-purple-400"
                          : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
                      }`}
                    >
                      {item.node}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-4">
              {[
                { color: "bg-green-500", label: "Concluído" },
                { color: "bg-purple-500", label: "Em andamento" },
                { color: "bg-purple-400", label: "Disponível" },
                { color: "bg-zinc-600", label: "Bloqueado" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-zinc-400 text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {activeTab === "lista" && (
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const isOpen = openCategories.includes(cat);
            const nodes = nodesByCategory(cat);
            const completed = nodes.filter(
              (n) => n.status === "completed"
            ).length;
            return (
              <div
                key={cat}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
                  onClick={() => toggleCategory(cat)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{cat}</span>
                    <span className="text-xs text-zinc-500">
                      {completed}/{nodes.length} concluídas
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
                    {nodes.map((node, i) => (
                      <div
                        key={node.id}
                        className={`flex items-center justify-between px-5 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer ${
                          i < nodes.length - 1 ? "border-b border-zinc-800/50" : ""
                        }`}
                        onClick={() => {
                          setSelectedNode(node);
                          setActiveTab("mapa");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {statusIcon(node.status)}
                          <span
                            className={
                              node.status === "locked"
                                ? "text-zinc-500 text-sm"
                                : "text-zinc-200 text-sm"
                            }
                          >
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
                              node.status === "completed"
                                ? "bg-green-500/10 text-green-400"
                                : node.status === "in-progress"
                                ? "bg-purple-500/10 text-purple-400"
                                : node.status === "available"
                                ? "bg-purple-400/10 text-purple-300"
                                : "bg-zinc-800 text-zinc-600"
                            }`}
                          >
                            {node.status === "completed"
                              ? "Concluído"
                              : node.status === "in-progress"
                              ? "Em andamento"
                              : node.status === "available"
                              ? "Disponível"
                              : "Bloqueado"}
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
