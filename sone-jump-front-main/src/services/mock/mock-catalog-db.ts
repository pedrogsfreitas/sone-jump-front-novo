/**
 * MOCK DB — catálogo de conteúdos (fase sem back-end)
 * ---------------------------------------------------------------------------
 * Lista fixa de conteúdos (ainda não existe um admin cadastrando conteúdo de
 * catálogo de verdade). Os bookmarks, por outro lado, são de cada usuário de
 * verdade — guardados em localStorage, igual o resto da base mockada.
 *
 * `url: null` em todos de propósito: são cursos/vídeos de plataformas reais
 * (Alura, Udemy, YouTube...), mas sem um link de verdade por trás não faz
 * sentido inventar uma URL — o botão "Acessar Conteúdo" simplesmente não
 * aparece nesse caso (Catalog.tsx já trata isso).
 */

import type { ContentItem } from "../catalog/catalog";

const CONTENT_STORAGE_KEY = "mock_catalog_bookmarks";

const MOCK_CONTENT: Omit<ContentItem, "bookmarked">[] = [
    {
        id: 1,
        title: "React do Zero ao Avançado",
        platform: "ALURA",
        type: "CURSO",
        durationMinutes: 480,
        level: "INTERMEDIARIO",
        rating: 4.7,
        description: "Componentes, hooks, gerenciamento de estado e roteamento para construir aplicações reais com React.",
        url: null,
        thumbnailEmoji: "⚛️",
        prerequisites: ["JavaScript básico"],
        syllabus: ["Componentes e Props", "Hooks essenciais", "Context API", "Roteamento com React Router"],
    },
    {
        id: 2,
        title: "JavaScript Moderno (ES6+)",
        platform: "ROCKETSEAT",
        type: "CURSO",
        durationMinutes: 360,
        level: "INICIANTE",
        rating: 4.8,
        description: "As bases da linguagem que roda no navegador: sintaxe moderna, funções, assincronismo e módulos.",
        url: null,
        thumbnailEmoji: "🟨",
        prerequisites: [],
        syllabus: ["Variáveis e escopo", "Arrow functions", "Promises e async/await", "Módulos ES6"],
    },
    {
        id: 3,
        title: "Node.js na Prática",
        platform: "ALURA",
        type: "CURSO",
        durationMinutes: 420,
        level: "INTERMEDIARIO",
        rating: 4.6,
        description: "Construção de servidores e APIs com Node.js, do banco de dados até o deploy.",
        url: null,
        thumbnailEmoji: "🟢",
        prerequisites: ["JavaScript"],
        syllabus: ["Criando um servidor Express", "Conectando a um banco de dados", "Autenticação com JWT", "Deploy"],
    },
    {
        id: 4,
        title: "O que é uma API REST? Entenda tudo sobre API, HTTP e RESTful",
        platform: "YOUTUBE",
        type: "VIDEO",
        durationMinutes: 20,
        level: "INICIANTE",
        rating: 4.5,
        description: "Vídeo do canal Hora de Codar explicando o que é uma API REST, verbos HTTP e como o frontend e o backend conversam entre si.",
        url: "https://www.youtube.com/watch?v=9SbUPqKEWcY",
        thumbnailEmoji: "🌐",
        prerequisites: [],
        syllabus: [],
    },
    {
        id: 5,
        title: "Python para Data Science",
        platform: "UDEMY",
        type: "CURSO",
        durationMinutes: 600,
        level: "INICIANTE",
        rating: 4.6,
        description: "Do zero em Python até manipulação e visualização de dados com Pandas e Matplotlib.",
        url: null,
        thumbnailEmoji: "🐍",
        prerequisites: [],
        syllabus: ["Fundamentos de Python", "Pandas e NumPy", "Visualização com Matplotlib", "Introdução a Machine Learning"],
    },
    {
        id: 6,
        title: "Machine Learning com Scikit-learn",
        platform: "DIO",
        type: "CURSO",
        durationMinutes: 300,
        level: "INTERMEDIARIO",
        rating: 4.4,
        description: "Modelos de classificação e regressão, e como avaliar se um modelo está bom de verdade.",
        url: null,
        thumbnailEmoji: "🤖",
        prerequisites: ["Python", "Estatística básica"],
        syllabus: ["Regressão linear", "Classificação", "Validação de modelos"],
    },
    {
        id: 7,
        title: "Docker em 22 Minutos - Teoria e Prática (Rápido!)",
        platform: "YOUTUBE",
        type: "VIDEO",
        durationMinutes: 22,
        level: "INICIANTE",
        rating: 4.7,
        description: "Containers, imagens e os comandos essenciais do Docker, direto ao ponto, num vídeo rápido de teoria e prática.",
        url: "https://www.youtube.com/watch?v=Kzcz-EVKBEQ",
        thumbnailEmoji: "🐳",
        prerequisites: [],
        syllabus: [],
    },
    {
        id: 8,
        title: "Kubernetes na Prática",
        platform: "ALURA",
        type: "CURSO",
        durationMinutes: 380,
        level: "AVANCADO",
        rating: 4.3,
        description: "Orquestração de containers em escala: pods, deployments, services e escalonamento.",
        url: null,
        thumbnailEmoji: "☸️",
        prerequisites: ["Docker"],
        syllabus: ["Pods e Deployments", "Services", "ConfigMaps e Secrets", "Escalonamento"],
    },
    {
        id: 9,
        title: "React Native do Zero",
        platform: "ROCKETSEAT",
        type: "CURSO",
        durationMinutes: 500,
        level: "INTERMEDIARIO",
        rating: 4.5,
        description: "Construção de apps mobile para iOS e Android com React Native, da navegação até a publicação.",
        url: null,
        thumbnailEmoji: "📱",
        prerequisites: ["React"],
        syllabus: ["Componentes nativos", "Navegação", "Consumo de APIs", "Publicação nas lojas"],
    },
    {
        id: 10,
        title: "Fundamentos de UX Design",
        platform: "UDEMY",
        type: "CURSO",
        durationMinutes: 320,
        level: "INICIANTE",
        rating: 4.6,
        description: "Pesquisa com usuários, wireframes, prototipação e os primeiros testes de usabilidade.",
        url: null,
        thumbnailEmoji: "🎨",
        prerequisites: [],
        syllabus: ["Pesquisa com usuários", "Wireframes", "Prototipação", "Testes de usabilidade"],
    },
    {
        id: 11,
        title: "Design Systems na Prática",
        platform: "ALURA",
        type: "ARTIGO",
        durationMinutes: 20,
        level: "INTERMEDIARIO",
        rating: 4.2,
        description: "Como construir um design system consistente e escalável para um produto digital.",
        url: null,
        thumbnailEmoji: "🧩",
        prerequisites: ["Figma básico"],
        syllabus: [],
    },
    {
        id: 12,
        title: "Monte seu Primeiro Projeto Full Stack",
        platform: "GITHUB",
        type: "PROJETO",
        durationMinutes: 240,
        level: "INTERMEDIARIO",
        rating: 4.5,
        description: "Um projeto guiado, do planejamento ao deploy, unindo backend, frontend e banco de dados.",
        url: null,
        thumbnailEmoji: "🚀",
        prerequisites: ["React", "Node.js"],
        syllabus: [
            "Planejamento do projeto",
            "Backend com API REST",
            "Frontend consumindo a API",
            "Deploy do projeto completo",
        ],
    },
];

function readBookmarks(): Record<number, number[]> {
    try {
        const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Record<number, number[]>) : {};
    } catch {
        return {};
    }
}

function writeBookmarks(all: Record<number, number[]>): void {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(all));
}

function withBookmarks(userId: number): ContentItem[] {
    const bookmarked = readBookmarks()[userId] ?? [];
    return MOCK_CONTENT.map((item) => ({ ...item, bookmarked: bookmarked.includes(item.id) }));
}

export function getMockCatalog(userId: number): ContentItem[] {
    return withBookmarks(userId);
}

export function getMockBookmarkedContent(userId: number): ContentItem[] {
    return withBookmarks(userId).filter((item) => item.bookmarked);
}

export function setMockBookmark(userId: number, contentId: number, bookmarked: boolean): void {
    const all = readBookmarks();
    const current = new Set(all[userId] ?? []);
    if (bookmarked) current.add(contentId);
    else current.delete(contentId);
    all[userId] = Array.from(current);
    writeBookmarks(all);
}