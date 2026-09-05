/**
 * MOCK DB — templates de roadmap por carreira (fase sem back-end)
 * ---------------------------------------------------------------------------
 * O "molde" das etapas de cada carreira — 5 etapas, uma por categoria
 * (Fundamentos, Core, Frameworks, Avançado, Carreira), na mesma ordem que a
 * tela de Roadmap já espera (CATEGORY_ORDER). Cada etapa já vem com o quiz
 * de validação (1 pergunta, por enquanto) que a pessoa precisa acertar para
 * poder marcar a etapa como concluída. Quando alguém escolhe uma carreira,
 * `mock-roadmap-db.ts` clona essas etapas e monta o roadmap dessa pessoa a
 * partir daqui — o template em si não muda.
 */

import type { RoadmapNode } from "../roadmap/roadmap";

export type NodeTemplate = Omit<RoadmapNode, "status" | "studyConfirmed" | "quizPassed">;

function quiz(nodeId: string, prompt: string, options: string[], correctIndex: number): NodeTemplate["quiz"] {
  return [
    {
      id: `${nodeId}-q1`,
      prompt,
      options: options.map((text, i) => ({ id: `${nodeId}-q1-${i}`, text })),
      correctOptionId: `${nodeId}-q1-${correctIndex}`,
    },
  ];
}

const TEMPLATES: Record<string, NodeTemplate[]> = {
  frontend: [
    {
      id: "frontend-fundamentos",
      name: "Lógica de Programação e Web Básico",
      category: "FUNDAMENTOS",
      hours: 40,
      description: "HTML, CSS e os fundamentos de lógica de programação para começar a construir na web.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("frontend-fundamentos", "Qual tag HTML é usada para criar um link?", ["<a>", "<link>", "<href>", "<div>"], 0),
    },
    {
      id: "frontend-core",
      name: "JavaScript Moderno (ES6+)",
      category: "CORE",
      hours: 50,
      description: "Sintaxe moderna, manipulação do DOM, assincronismo e as bases da linguagem que roda no navegador.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("frontend-core", "O que o método .map() faz em um array JavaScript?", ["Cria um novo array aplicando uma função a cada item", "Remove itens do array", "Verifica se um item existe", "Ordena o array"], 0),
    },
    {
      id: "frontend-frameworks",
      name: "React e Ecossistema",
      category: "FRAMEWORKS",
      hours: 60,
      description: "Componentes, hooks, gerenciamento de estado e roteamento com React.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("frontend-frameworks", "No React, o que é usado para guardar um estado que muda com o tempo?", ["useState", "useEffect", "useRef", "useMemo"], 0),
    },
    {
      id: "frontend-avancado",
      name: "Performance e Testes em Frontend",
      category: "AVANCADO",
      hours: 35,
      description: "Otimização de renderização, boas práticas de acessibilidade e testes automatizados.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("frontend-avancado", "O que é 'lazy loading' no contexto de performance web?", ["Carregar recursos só quando são necessários", "Carregar tudo de uma vez", "Remover todo o CSS", "Comprimir todas as imagens automaticamente"], 0),
    },
    {
      id: "frontend-carreira",
      name: "Portfólio e Preparação para Entrevistas",
      category: "CARREIRA",
      hours: 20,
      description: "Monte projetos reais para o portfólio e prepare-se para entrevistas técnicas.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("frontend-carreira", "O que geralmente é avaliado em uma entrevista técnica de frontend júnior?", ["Fundamentos de JS, HTML/CSS e lógica", "Apenas o currículo", "Apenas soft skills", "Apenas inglês"], 0),
    },
  ],
  backend: [
    {
      id: "backend-fundamentos",
      name: "Lógica de Programação e Banco de Dados",
      category: "FUNDAMENTOS",
      hours: 40,
      description: "Fundamentos de lógica, estrutura de dados e modelagem de bancos relacionais.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("backend-fundamentos", "Em bancos relacionais, o que é uma chave primária?", ["Identificador único de um registro", "Uma senha do banco", "Um tipo de índice de texto", "Um comando SQL"], 0),
    },
    {
      id: "backend-core",
      name: "Node.js e APIs REST",
      category: "CORE",
      hours: 55,
      description: "Construção de servidores e APIs REST com Node.js, autenticação e validação de dados.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("backend-core", "Qual verbo HTTP é usado para criar um novo recurso em uma API REST?", ["POST", "GET", "DELETE", "OPTIONS"], 0),
    },
    {
      id: "backend-frameworks",
      name: "Frameworks de Backend",
      category: "FRAMEWORKS",
      hours: 50,
      description: "Organização de projetos maiores com frameworks como Express ou NestJS.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("backend-frameworks", "Qual é uma vantagem de usar um framework como Express/NestJS?", ["Organização e estrutura prontas para rotas e middlewares", "Elimina a necessidade de banco de dados", "Substitui o JavaScript", "Impede erros de lógica"], 0),
    },
    {
      id: "backend-avancado",
      name: "Arquitetura, Filas e Escalabilidade",
      category: "AVANCADO",
      hours: 40,
      description: "Boas práticas de arquitetura, filas de mensageria e como preparar um sistema para escalar.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("backend-avancado", "Para que servem filas de mensageria (ex.: RabbitMQ)?", ["Processar tarefas de forma assíncrona e desacoplada", "Armazenar senhas", "Substituir o banco de dados", "Renderizar páginas HTML"], 0),
    },
    {
      id: "backend-carreira",
      name: "Portfólio e Preparação para Entrevistas",
      category: "CARREIRA",
      hours: 20,
      description: "Monte projetos reais para o portfólio e prepare-se para entrevistas técnicas.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("backend-carreira", "O que costuma ser pedido em uma entrevista técnica de backend júnior?", ["Modelagem de dados, APIs REST e lógica", "Apenas design de telas", "Apenas marketing", "Apenas hardware"], 0),
    },
  ],
  "data-science": [
    {
      id: "data-science-fundamentos",
      name: "Matemática, Estatística e Python",
      category: "FUNDAMENTOS",
      hours: 50,
      description: "Estatística básica, álgebra linear e a linguagem Python aplicada a dados.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("data-science-fundamentos", "Qual biblioteca Python é mais usada para manipulação de dados em tabelas?", ["Pandas", "Django", "Flask", "React"], 0),
    },
    {
      id: "data-science-core",
      name: "Manipulação de Dados",
      category: "CORE",
      hours: 50,
      description: "Limpeza, transformação e análise exploratória de dados com Pandas e SQL.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("data-science-core", "Para que serve uma consulta SQL do tipo SELECT?", ["Ler dados de uma tabela", "Apagar uma tabela", "Criar um gráfico", "Treinar um modelo"], 0),
    },
    {
      id: "data-science-frameworks",
      name: "Machine Learning",
      category: "FRAMEWORKS",
      hours: 60,
      description: "Modelos preditivos com Scikit-learn: classificação, regressão e avaliação de modelos.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("data-science-frameworks", "O que significa 'overfitting' em Machine Learning?", ["O modelo decorou os dados de treino e generaliza mal", "O modelo é rápido demais", "O modelo usa pouca memória", "O modelo tem poucos dados"], 0),
    },
    {
      id: "data-science-avancado",
      name: "Deep Learning e Deploy de Modelos",
      category: "AVANCADO",
      hours: 45,
      description: "Redes neurais e como colocar um modelo treinado em produção.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("data-science-avancado", "O que é uma rede neural, de forma simples?", ["Um modelo inspirado no cérebro, com camadas de unidades conectadas", "Um tipo de banco de dados", "Um protocolo de rede", "Uma linguagem de programação"], 0),
    },
    {
      id: "data-science-carreira",
      name: "Portfólio e Preparação para Entrevistas",
      category: "CARREIRA",
      hours: 20,
      description: "Monte projetos reais para o portfólio e prepare-se para entrevistas técnicas.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("data-science-carreira", "O que costuma compor o portfólio de um cientista de dados júnior?", ["Projetos de análise e modelos com dados reais", "Apenas certificados", "Apenas planilhas", "Apenas vídeos"], 0),
    },
  ],
  devops: [
    {
      id: "devops-fundamentos",
      name: "Linux, Redes e Linha de Comando",
      category: "FUNDAMENTOS",
      hours: 40,
      description: "Fundamentos de sistemas Linux, redes e uso do terminal no dia a dia.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("devops-fundamentos", "Qual comando Linux lista os arquivos de um diretório?", ["ls", "cd", "rm", "ps"], 0),
    },
    {
      id: "devops-core",
      name: "Containers com Docker",
      category: "CORE",
      hours: 35,
      description: "Empacotamento de aplicações em containers e boas práticas com Docker.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("devops-core", "Para que serve o Docker?", ["Empacotar aplicações em containers isolados", "Editar código-fonte", "Hospedar sites estáticos", "Substituir o sistema operacional"], 0),
    },
    {
      id: "devops-frameworks",
      name: "Orquestração com Kubernetes",
      category: "FRAMEWORKS",
      hours: 55,
      description: "Deploy e gerenciamento de containers em escala com Kubernetes.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("devops-frameworks", "O que o Kubernetes ajuda a fazer?", ["Orquestrar e escalar containers automaticamente", "Compilar código Java", "Desenhar interfaces", "Enviar e-mails"], 0),
    },
    {
      id: "devops-avancado",
      name: "CI/CD e Infraestrutura como Código",
      category: "AVANCADO",
      hours: 45,
      description: "Pipelines de integração contínua e provisionamento de infraestrutura com código.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("devops-avancado", "O que é CI/CD?", ["Automação de integração e entrega contínua de código", "Um tipo de banco de dados", "Um framework de frontend", "Um protocolo de segurança"], 0),
    },
    {
      id: "devops-carreira",
      name: "Portfólio e Preparação para Entrevistas",
      category: "CARREIRA",
      hours: 20,
      description: "Monte projetos reais para o portfólio e prepare-se para entrevistas técnicas.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("devops-carreira", "O que costuma ser avaliado numa entrevista de DevOps júnior?", ["Linux, containers e automação de deploy", "Apenas design gráfico", "Apenas vendas", "Apenas redação"], 0),
    },
  ],
  mobile: [
    {
      id: "mobile-fundamentos",
      name: "Lógica de Programação e UI Mobile",
      category: "FUNDAMENTOS",
      hours: 40,
      description: "Fundamentos de lógica de programação e princípios de interface para telas mobile.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("mobile-fundamentos", "Qual linguagem é usada como base do React Native?", ["JavaScript", "Swift puro", "Kotlin puro", "PHP"], 0),
    },
    {
      id: "mobile-core",
      name: "React Native Essencial",
      category: "CORE",
      hours: 55,
      description: "Componentes, estilos e navegação básica com React Native.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("mobile-core", "No React Native, qual componente é usado para exibir texto?", ["<Text>", "<p>", "<span>", "<label>"], 0),
    },
    {
      id: "mobile-frameworks",
      name: "Navegação, Estado e APIs Nativas",
      category: "FRAMEWORKS",
      hours: 50,
      description: "Gerenciamento de estado, integração com APIs e recursos nativos do dispositivo.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("mobile-frameworks", "Para navegar entre telas em um app React Native, geralmente se usa:", ["React Navigation", "React Router DOM", "Express Router", "Django URLs"], 0),
    },
    {
      id: "mobile-avancado",
      name: "Performance e Publicação nas Lojas",
      category: "AVANCADO",
      hours: 35,
      description: "Otimização do app e o processo de publicação na App Store e Google Play.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("mobile-avancado", "O que costuma ser necessário para publicar um app na Google Play?", ["Conta de desenvolvedor e assinatura digital do app", "Apenas o código-fonte", "Nada além de um e-mail", "Apenas um domínio"], 0),
    },
    {
      id: "mobile-carreira",
      name: "Portfólio e Preparação para Entrevistas",
      category: "CARREIRA",
      hours: 20,
      description: "Monte projetos reais para o portfólio e prepare-se para entrevistas técnicas.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("mobile-carreira", "O que costuma ser avaliado em uma entrevista de mobile júnior?", ["Lógica, componentes e integração com APIs", "Apenas design", "Apenas idiomas", "Apenas marketing"], 0),
    },
  ],
  "ux-ui": [
    {
      id: "ux-ui-fundamentos",
      name: "Fundamentos de Design e Usabilidade",
      category: "FUNDAMENTOS",
      hours: 35,
      description: "Princípios de design visual, hierarquia e usabilidade aplicados a produtos digitais.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("ux-ui-fundamentos", "O que significa 'usabilidade' em design de produto?", ["Facilidade de uso de uma interface pelo usuário", "Quantidade de cores usadas", "Velocidade do servidor", "Tamanho do arquivo"], 0),
    },
    {
      id: "ux-ui-core",
      name: "Design de Interfaces com Figma",
      category: "CORE",
      hours: 45,
      description: "Criação de telas e componentes de interface usando o Figma.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("ux-ui-core", "Qual ferramenta é amplamente usada para prototipagem de interfaces?", ["Figma", "Excel", "Word", "Notion"], 0),
    },
    {
      id: "ux-ui-frameworks",
      name: "Design Systems e Prototipação",
      category: "FRAMEWORKS",
      hours: 40,
      description: "Construção de design systems consistentes e protótipos interativos.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("ux-ui-frameworks", "O que é um Design System?", ["Um conjunto padronizado de componentes e regras visuais reutilizáveis", "Um banco de dados de imagens", "Um framework de backend", "Um tipo de teste automatizado"], 0),
    },
    {
      id: "ux-ui-avancado",
      name: "Pesquisa com Usuários e Testes de Usabilidade",
      category: "AVANCADO",
      hours: 35,
      description: "Métodos de pesquisa com usuários e como validar decisões de design na prática.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("ux-ui-avancado", "O que é um teste de usabilidade?", ["Observar usuários reais usando o produto para encontrar problemas", "Testar a velocidade do servidor", "Testar a segurança do código", "Testar performance de banco de dados"], 0),
    },
    {
      id: "ux-ui-carreira",
      name: "Portfólio e Preparação para Entrevistas",
      category: "CARREIRA",
      hours: 20,
      description: "Monte um case de portfólio e prepare-se para entrevistas de design.",
      resources: [{ label: "Conteúdos disponíveis no Catálogo", url: null }],
      quiz: quiz("ux-ui-carreira", "O que costuma compor o portfólio de um designer UX/UI júnior?", ["Estudos de caso com processo de pesquisa e decisões de design", "Apenas certificados", "Apenas fotos pessoais", "Apenas currículo"], 0),
    },
  ],
};

export function getRoadmapTemplate(careerSlug: string): NodeTemplate[] | undefined {
  return TEMPLATES[careerSlug];
}

export function findNodeTemplate(careerSlug: string, nodeId: string): NodeTemplate | undefined {
  return TEMPLATES[careerSlug]?.find((n) => n.id === nodeId);
}