/**
 * MOCK DB — carreiras (fase sem back-end)
 * ---------------------------------------------------------------------------
 * Lista fixa de carreiras — ainda não existe um jeito de um admin cadastrar
 * carreiras novas, então isso fica igual a uma "tabela seed": os mesmos 6
 * slugs usados no quiz (Onboarding/CareerQuiz) e nos ícones do Explore.
 */

import type { Career } from "../careers/careers";

const MOCK_CAREERS: Career[] = [
  {
    id: "frontend",
    slug: "frontend",
    title: "Frontend",
    iconKey: "monitor",
    salaryMin: 3000,
    salaryMax: 9000,
    avgMonthsMin: 6,
    avgMonthsMax: 12,
    description: "Construa interfaces e experiências que rodam no navegador com HTML, CSS, JavaScript e React.",
    jobsDemandLevel: "ALTA",
    difficultyLevel: "MEDIA",
  },
  {
    id: "backend",
    slug: "backend",
    title: "Backend",
    iconKey: "server",
    salaryMin: 3500,
    salaryMax: 10000,
    avgMonthsMin: 7,
    avgMonthsMax: 14,
    description: "Projete APIs, bancos de dados e a lógica que sustenta os sistemas por trás das aplicações.",
    jobsDemandLevel: "ALTA",
    difficultyLevel: "MEDIA",
  },
  {
    id: "data-science",
    slug: "data-science",
    title: "Data Science",
    iconKey: "chart",
    salaryMin: 4000,
    salaryMax: 12000,
    avgMonthsMin: 9,
    avgMonthsMax: 16,
    description: "Analise dados, construa modelos preditivos e extraia insights com Python e Machine Learning.",
    jobsDemandLevel: "MEDIA",
    difficultyLevel: "ALTA",
  },
  {
    id: "devops",
    slug: "devops",
    title: "DevOps",
    iconKey: "git-branch",
    salaryMin: 4500,
    salaryMax: 13000,
    avgMonthsMin: 8,
    avgMonthsMax: 15,
    description: "Automatize infraestrutura, pipelines de deploy e mantenha sistemas no ar com Docker e Kubernetes.",
    jobsDemandLevel: "MEDIA",
    difficultyLevel: "ALTA",
  },
  {
    id: "mobile",
    slug: "mobile",
    title: "Mobile",
    iconKey: "smartphone",
    salaryMin: 3500,
    salaryMax: 10000,
    avgMonthsMin: 7,
    avgMonthsMax: 13,
    description: "Desenvolva aplicativos para iOS e Android com React Native e publique nas lojas de apps.",
    jobsDemandLevel: "MEDIA",
    difficultyLevel: "MEDIA",
  },
  {
    id: "ux-ui",
    slug: "ux-ui",
    title: "UX/UI",
    iconKey: "palette",
    salaryMin: 3000,
    salaryMax: 8500,
    avgMonthsMin: 5,
    avgMonthsMax: 10,
    description: "Pesquise usuários, desenhe interfaces e crie experiências digitais fáceis e agradáveis de usar.",
    jobsDemandLevel: "MEDIA",
    difficultyLevel: "BAIXA",
  },
];

export function getMockCareers(): Career[] {
  return MOCK_CAREERS;
}

export function findMockCareerBySlug(slug: string): Career | undefined {
  return MOCK_CAREERS.find((c) => c.slug === slug);
}