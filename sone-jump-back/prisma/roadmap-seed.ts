/**
 * Roadmap de cada carreira — o conteúdo que o aluno percorre.
 *
 * Ficava só no seed e cobria uma carreira (Frontend); as outras cinco existiam na
 * listagem mas devolviam roadmap vazio para quem as escolhesse. O front chegou a
 * manter uma base mockada por causa disso.
 *
 * `key` é a identidade estável do nó DENTRO da carreira. O id gravado é
 * `<slug>-<key>`, então "React" em Frontend e "React Native" em Mobile são linhas
 * independentes, com progresso próprio — o modelo de cópia por carreira da Fase 8.
 */

export type RoadmapCategory =
  | 'FUNDAMENTOS'
  | 'CORE'
  | 'FRAMEWORKS'
  | 'AVANCADO'
  | 'CARREIRA';

export interface QuizSeed {
  prompt: string;
  options: string[];
  /** Índice da alternativa correta em `options`. Nunca chega ao cliente. */
  correctIndex: number;
}

export interface NodeSeed {
  key: string;
  name: string;
  category: RoadmapCategory;
  hours: number;
  description: string;
  /** Nome de uma Skill já cadastrada, quando houver correspondência. */
  skill?: string;
  /** Chaves (`key`) de outros nós da MESMA carreira. */
  prerequisites?: string[];
  resources: Array<{ label: string; url?: string }>;
  quiz: QuizSeed[];
}

const frontend: NodeSeed[] = [
  {
    key: 'html-css',
    name: 'HTML/CSS',
    category: 'FUNDAMENTOS',
    hours: 40,
    description: 'Fundação da web: estrutura semântica e estilização.',
    skill: 'HTML/CSS',
    resources: [
      { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { label: 'CSS Tricks', url: 'https://css-tricks.com' },
    ],
    quiz: [
      {
        prompt: 'Qual tag HTML representa o conteúdo principal da página?',
        options: ['<main>', '<div>', '<section>', '<body>'],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'responsividade',
    name: 'Responsividade',
    category: 'FUNDAMENTOS',
    hours: 20,
    description: 'Layouts que se adaptam a qualquer tamanho de tela.',
    skill: 'Responsividade',
    prerequisites: ['html-css'],
    resources: [{ label: 'MDN Responsive Design' }],
    quiz: [
      {
        prompt: 'Para que serve uma media query em CSS?',
        options: [
          'Aplicar estilos diferentes conforme características da tela',
          'Carregar imagens mais rápido',
          'Validar formulários',
          'Consultar uma API',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'javascript',
    name: 'JavaScript',
    category: 'CORE',
    hours: 60,
    description: 'A linguagem que dá vida à web.',
    skill: 'JavaScript',
    prerequisites: ['responsividade'],
    resources: [{ label: 'JavaScript.info' }],
    quiz: [
      {
        prompt: 'O que `Array.prototype.map()` retorna?',
        options: [
          'Um novo array com o resultado da função em cada item',
          'O array original modificado',
          'O primeiro item que satisfaz a condição',
          'A quantidade de itens do array',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'git',
    name: 'Git/GitHub',
    category: 'CORE',
    hours: 15,
    description: 'Versionamento e colaboração em equipe.',
    skill: 'Git/GitHub',
    prerequisites: ['javascript'],
    resources: [{ label: 'Pro Git', url: 'https://git-scm.com/book' }],
    quiz: [
      {
        prompt: 'O que `git merge` faz?',
        options: [
          'Integra o histórico de um branch em outro',
          'Apaga o branch atual',
          'Envia commits para o repositório remoto',
          'Desfaz o último commit',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'react',
    name: 'React',
    category: 'FRAMEWORKS',
    hours: 60,
    description: 'Componentes, hooks e gerenciamento de estado.',
    skill: 'React',
    prerequisites: ['git'],
    resources: [{ label: 'React Docs', url: 'https://react.dev' }],
    quiz: [
      {
        prompt: 'Qual hook guarda um estado que muda ao longo do tempo?',
        options: ['useState', 'useEffect', 'useRef', 'useMemo'],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'typescript',
    name: 'TypeScript',
    category: 'FRAMEWORKS',
    hours: 30,
    description: 'Tipagem estática sobre JavaScript.',
    skill: 'TypeScript',
    prerequisites: ['react'],
    resources: [{ label: 'TypeScript Handbook' }],
    quiz: [
      {
        prompt: 'Qual a principal vantagem do TypeScript sobre JavaScript?',
        options: [
          'Erros de tipo aparecem na compilação, antes de rodar',
          'O código executa mais rápido no navegador',
          'Dispensa o uso de bundlers',
          'Elimina a necessidade de testes',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'nextjs',
    name: 'Next.js',
    category: 'AVANCADO',
    hours: 40,
    description: 'Renderização no servidor e rotas de aplicação.',
    skill: 'Next.js',
    prerequisites: ['typescript'],
    resources: [{ label: 'Next.js Docs', url: 'https://nextjs.org/docs' }],
    quiz: [
      {
        prompt: 'O que server-side rendering resolve?',
        options: [
          'A página chega pronta ao navegador, melhorando carregamento e indexação',
          'Elimina a necessidade de banco de dados',
          'Faz o CSS carregar depois do JavaScript',
          'Substitui o uso de APIs',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'testes',
    name: 'Testes e Performance',
    category: 'AVANCADO',
    hours: 30,
    description: 'Testes automatizados, acessibilidade e otimização de renderização.',
    prerequisites: ['nextjs'],
    resources: [{ label: 'Testing Library' }],
    quiz: [
      {
        prompt: 'O que é lazy loading?',
        options: [
          'Carregar um recurso apenas quando ele é necessário',
          'Carregar todos os recursos de uma vez',
          'Remover o CSS não utilizado',
          'Comprimir imagens automaticamente',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'portfolio',
    name: 'Portfólio',
    category: 'CARREIRA',
    hours: 20,
    description: 'Projetos que demonstram o que você sabe fazer.',
    prerequisites: ['testes'],
    resources: [{ label: 'Guia de portfólio para devs' }],
    quiz: [
      {
        prompt: 'O que mais pesa num portfólio de desenvolvedor?',
        options: [
          'Projetos publicados, com código acessível e problema real resolvido',
          'A quantidade de repositórios na conta',
          'O tema visual do site',
          'A lista de tecnologias citadas',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'entrevistas',
    name: 'Entrevistas',
    category: 'CARREIRA',
    hours: 15,
    description: 'Preparação técnica e comportamental para processos seletivos.',
    prerequisites: ['portfolio'],
    resources: [{ label: 'Guia de entrevistas técnicas' }],
    quiz: [
      {
        prompt: 'Numa entrevista técnica, por que verbalizar o raciocínio importa?',
        options: [
          'A avaliação é sobre como você aborda o problema, não só sobre a resposta',
          'Aumenta o tempo disponível para responder',
          'Substitui a necessidade de chegar à solução',
          'Evita perguntas de acompanhamento',
        ],
        correctIndex: 0,
      },
    ],
  },
];

const backend: NodeSeed[] = [
  {
    key: 'logica',
    name: 'Lógica e Estruturas de Dados',
    category: 'FUNDAMENTOS',
    hours: 40,
    description: 'Raciocínio algorítmico, complexidade e estruturas fundamentais.',
    resources: [{ label: 'Estruturas de dados na prática' }],
    quiz: [
      {
        prompt: 'O que caracteriza uma estrutura de dados do tipo pilha (stack)?',
        options: [
          'O último elemento inserido é o primeiro a sair',
          'O primeiro elemento inserido é o primeiro a sair',
          'Os elementos ficam sempre ordenados',
          'O acesso é feito por chave',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'linguagem',
    name: 'Node.js e TypeScript',
    category: 'CORE',
    hours: 50,
    description: 'A linguagem e o runtime do lado do servidor.',
    skill: 'Node.js',
    prerequisites: ['logica'],
    resources: [{ label: 'Node.js Docs', url: 'https://nodejs.org/docs' }],
    quiz: [
      {
        prompt: 'O que significa dizer que o Node.js é não-bloqueante?',
        options: [
          'Operações de I/O não travam a execução enquanto aguardam resposta',
          'Ele executa em várias CPUs por padrão',
          'Ele não permite código síncrono',
          'Ele reinicia sozinho em caso de erro',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'bancos',
    name: 'Bancos de Dados e SQL',
    category: 'CORE',
    hours: 45,
    description: 'Modelagem relacional, SQL, índices e transações.',
    prerequisites: ['linguagem'],
    resources: [{ label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs' }],
    quiz: [
      {
        prompt: 'Para que serve um índice num banco relacional?',
        options: [
          'Acelerar consultas ao custo de escrita e espaço em disco',
          'Garantir que os dados não se percam',
          'Reduzir o tamanho do banco',
          'Impedir registros duplicados',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'apis',
    name: 'APIs REST e Autenticação',
    category: 'FRAMEWORKS',
    hours: 50,
    description: 'Construção de APIs, autenticação com tokens e autorização.',
    prerequisites: ['bancos'],
    resources: [{ label: 'NestJS Docs', url: 'https://docs.nestjs.com' }],
    quiz: [
      {
        prompt: 'Qual a diferença entre os status HTTP 401 e 403?',
        options: [
          '401 é não autenticado; 403 é autenticado mas sem permissão',
          '401 é erro do servidor; 403 é erro do cliente',
          'São sinônimos',
          '401 é permanente; 403 é temporário',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'arquitetura',
    name: 'Arquitetura e Testes',
    category: 'AVANCADO',
    hours: 40,
    description: 'Camadas, injeção de dependência, testes automatizados e cache.',
    prerequisites: ['apis'],
    resources: [{ label: 'Padrões de arquitetura de aplicações' }],
    quiz: [
      {
        prompt: 'Por que separar regra de negócio da camada HTTP?',
        options: [
          'A regra passa a ser testável e reutilizável sem depender de requisições',
          'Reduz o número de arquivos do projeto',
          'Torna a aplicação mais rápida',
          'Elimina a necessidade de validação de entrada',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'carreira',
    name: 'Portfólio e Entrevistas',
    category: 'CARREIRA',
    hours: 20,
    description: 'APIs publicadas, documentação e preparação para processos seletivos.',
    prerequisites: ['arquitetura'],
    resources: [{ label: 'Guia de entrevistas back-end' }],
    quiz: [
      {
        prompt: 'O que torna um projeto de back-end convincente num portfólio?',
        options: [
          'Estar no ar, documentado e resolvendo um problema concreto',
          'Usar o maior número possível de tecnologias',
          'Ter muitos commits',
          'Ter o README mais longo',
        ],
        correctIndex: 0,
      },
    ],
  },
];

const dataScience: NodeSeed[] = [
  {
    key: 'estatistica',
    name: 'Estatística e Matemática',
    category: 'FUNDAMENTOS',
    hours: 50,
    description: 'Probabilidade, distribuições, inferência e álgebra linear.',
    resources: [{ label: 'Estatística prática para ciência de dados' }],
    quiz: [
      {
        prompt: 'Por que a mediana costuma descrever melhor que a média um salário típico?',
        options: [
          'Ela é menos afetada por valores extremos',
          'Ela é sempre maior que a média',
          'Ela usa todos os valores no cálculo',
          'Ela exige menos dados',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'python',
    name: 'Python para Dados',
    category: 'CORE',
    hours: 50,
    description: 'Python, pandas e NumPy para manipulação e análise.',
    prerequisites: ['estatistica'],
    resources: [{ label: 'pandas Docs', url: 'https://pandas.pydata.org/docs' }],
    quiz: [
      {
        prompt: 'O que é um DataFrame no pandas?',
        options: [
          'Uma tabela bidimensional com colunas nomeadas e tipadas',
          'Um gráfico gerado a partir de dados',
          'Uma conexão com banco de dados',
          'Um modelo de machine learning',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'sql-dados',
    name: 'SQL e Preparação de Dados',
    category: 'CORE',
    hours: 40,
    description: 'Consultas analíticas, limpeza e transformação de dados.',
    prerequisites: ['python'],
    resources: [{ label: 'SQL para análise de dados' }],
    quiz: [
      {
        prompt: 'Numa análise, por que tratar valores ausentes antes de modelar?',
        options: [
          'Eles distorcem estatísticas e quebram a maioria dos algoritmos',
          'Eles aumentam o tamanho do arquivo',
          'Eles impedem a leitura do CSV',
          'Eles deixam o gráfico mais lento',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'ml',
    name: 'Machine Learning',
    category: 'FRAMEWORKS',
    hours: 60,
    description: 'Modelos supervisionados, validação e métricas de avaliação.',
    prerequisites: ['sql-dados'],
    resources: [{ label: 'scikit-learn Docs', url: 'https://scikit-learn.org' }],
    quiz: [
      {
        prompt: 'O que é overfitting?',
        options: [
          'O modelo decora o treino e vai mal em dados novos',
          'O modelo é lento para treinar',
          'O modelo tem poucos parâmetros',
          'Os dados de treino são insuficientes',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'visualizacao',
    name: 'Visualização e Comunicação',
    category: 'AVANCADO',
    hours: 30,
    description: 'Gráficos, dashboards e narrativa a partir dos dados.',
    prerequisites: ['ml'],
    resources: [{ label: 'Storytelling with Data' }],
    quiz: [
      {
        prompt: 'Qual gráfico é mais adequado para mostrar evolução ao longo do tempo?',
        options: ['Gráfico de linha', 'Gráfico de pizza', 'Histograma', 'Mapa de calor'],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'carreira',
    name: 'Portfólio de Projetos',
    category: 'CARREIRA',
    hours: 25,
    description: 'Notebooks publicados, projetos de ponta a ponta e entrevistas.',
    prerequisites: ['visualizacao'],
    resources: [{ label: 'Guia de portfólio em dados' }],
    quiz: [
      {
        prompt: 'O que diferencia um bom projeto de dados no portfólio?',
        options: [
          'Partir de uma pergunta clara e chegar a uma conclusão justificada',
          'Usar o maior conjunto de dados possível',
          'Aplicar o máximo de algoritmos diferentes',
          'Ter o notebook mais longo',
        ],
        correctIndex: 0,
      },
    ],
  },
];

const devops: NodeSeed[] = [
  {
    key: 'linux',
    name: 'Linux e Redes',
    category: 'FUNDAMENTOS',
    hours: 40,
    description: 'Linha de comando, permissões, processos e fundamentos de rede.',
    resources: [{ label: 'Linux Journey', url: 'https://linuxjourney.com' }],
    quiz: [
      {
        prompt: 'O que o comando `chmod` faz?',
        options: [
          'Altera as permissões de acesso de um arquivo',
          'Muda o dono do arquivo',
          'Renomeia o arquivo',
          'Exibe o conteúdo do arquivo',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'containers',
    name: 'Docker e Containers',
    category: 'CORE',
    hours: 40,
    description: 'Imagens, contêineres, volumes e redes.',
    prerequisites: ['linux'],
    resources: [{ label: 'Docker Docs', url: 'https://docs.docker.com' }],
    quiz: [
      {
        prompt: 'Qual a diferença entre uma imagem e um contêiner?',
        options: [
          'A imagem é o modelo imutável; o contêiner é uma execução dela',
          'São nomes diferentes para a mesma coisa',
          'A imagem roda; o contêiner é armazenado',
          'O contêiner só existe em produção',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'ci-cd',
    name: 'CI/CD',
    category: 'CORE',
    hours: 35,
    description: 'Pipelines de build, teste e entrega automatizada.',
    prerequisites: ['containers'],
    resources: [{ label: 'GitHub Actions Docs' }],
    quiz: [
      {
        prompt: 'O que integração contínua resolve?',
        options: [
          'Detecta cedo que uma mudança quebrou o projeto, a cada alteração',
          'Publica a aplicação automaticamente em produção',
          'Substitui a revisão de código',
          'Elimina a necessidade de testes',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'cloud',
    name: 'Cloud e Infraestrutura como Código',
    category: 'FRAMEWORKS',
    hours: 50,
    description: 'Provedores de nuvem, Terraform e provisionamento declarativo.',
    prerequisites: ['ci-cd'],
    resources: [{ label: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform' }],
    quiz: [
      {
        prompt: 'Qual a vantagem de infraestrutura como código?',
        options: [
          'O ambiente vira versionável, revisável e reproduzível',
          'Reduz o custo da nuvem automaticamente',
          'Dispensa monitoramento',
          'Elimina a necessidade de backup',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'observabilidade',
    name: 'Observabilidade e Confiabilidade',
    category: 'AVANCADO',
    hours: 35,
    description: 'Métricas, logs, tracing e resposta a incidentes.',
    prerequisites: ['cloud'],
    resources: [{ label: 'Google SRE Book', url: 'https://sre.google/books' }],
    quiz: [
      {
        prompt: 'Qual a diferença entre log e métrica?',
        options: [
          'Log registra eventos individuais; métrica agrega valores ao longo do tempo',
          'Log é numérico; métrica é textual',
          'Métrica só existe em produção',
          'São a mesma coisa com nomes diferentes',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'carreira',
    name: 'Certificações e Entrevistas',
    category: 'CARREIRA',
    hours: 25,
    description: 'Certificações de nuvem e preparação para processos seletivos.',
    prerequisites: ['observabilidade'],
    resources: [{ label: 'Guia de certificações cloud' }],
    quiz: [
      {
        prompt: 'Em DevOps, o que costuma pesar mais numa entrevista?',
        options: [
          'Saber explicar decisões de arquitetura e trade-offs de confiabilidade',
          'Decorar comandos de terminal',
          'Ter o maior número de certificações',
          'Conhecer todos os provedores de nuvem',
        ],
        correctIndex: 0,
      },
    ],
  },
];

const mobile: NodeSeed[] = [
  {
    key: 'fundamentos',
    name: 'Lógica e Fundamentos Mobile',
    category: 'FUNDAMENTOS',
    hours: 35,
    description: 'Programação, ciclo de vida de apps e diferenças entre plataformas.',
    resources: [{ label: 'Fundamentos de desenvolvimento mobile' }],
    quiz: [
      {
        prompt: 'Por que o ciclo de vida importa no desenvolvimento mobile?',
        options: [
          'O sistema pode pausar ou encerrar o app, e o estado precisa sobreviver a isso',
          'Ele determina o tamanho do aplicativo',
          'Ele define a linguagem usada',
          'Ele controla a bateria do aparelho',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'javascript-mobile',
    name: 'JavaScript e TypeScript',
    category: 'CORE',
    hours: 45,
    description: 'A base de linguagem para desenvolvimento multiplataforma.',
    skill: 'JavaScript',
    prerequisites: ['fundamentos'],
    resources: [{ label: 'JavaScript.info' }],
    quiz: [
      {
        prompt: 'O que `async/await` resolve?',
        options: [
          'Escrever código assíncrono de forma sequencial e legível',
          'Executar código em várias threads',
          'Tornar a execução mais rápida',
          'Evitar erros de tipo',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'react-native',
    name: 'React Native',
    category: 'FRAMEWORKS',
    hours: 60,
    description: 'Componentes, navegação e acesso a recursos do dispositivo.',
    skill: 'React',
    prerequisites: ['javascript-mobile'],
    resources: [{ label: 'React Native Docs', url: 'https://reactnative.dev' }],
    quiz: [
      {
        prompt: 'O que diferencia React Native de um app web dentro de um WebView?',
        options: [
          'Ele renderiza componentes nativos da plataforma',
          'Ele roda mais rápido por usar HTML',
          'Ele não precisa de JavaScript',
          'Ele funciona apenas em Android',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'estado-dados',
    name: 'Estado, APIs e Armazenamento',
    category: 'FRAMEWORKS',
    hours: 40,
    description: 'Gerenciamento de estado, consumo de APIs e persistência local.',
    prerequisites: ['react-native'],
    resources: [{ label: 'Guia de estado em React Native' }],
    quiz: [
      {
        prompt: 'Por que apps mobile precisam tratar o modo offline?',
        options: [
          'A conexão é instável por natureza, e o app não pode simplesmente falhar',
          'Para reduzir o tamanho do aplicativo',
          'Para acelerar a compilação',
          'Porque as lojas exigem',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'publicacao',
    name: 'Performance e Publicação',
    category: 'AVANCADO',
    hours: 35,
    description: 'Otimização, build de release e publicação nas lojas.',
    prerequisites: ['estado-dados'],
    resources: [{ label: 'Guia de publicação nas lojas' }],
    quiz: [
      {
        prompt: 'O que é um build de release, em oposição ao de desenvolvimento?',
        options: [
          'Versão otimizada e assinada, destinada à distribuição',
          'Versão que inclui as ferramentas de depuração',
          'Versão que roda apenas no emulador',
          'Versão sem dependências externas',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'carreira',
    name: 'Portfólio e Entrevistas',
    category: 'CARREIRA',
    hours: 20,
    description: 'Apps publicados e preparação para processos seletivos.',
    prerequisites: ['publicacao'],
    resources: [{ label: 'Guia de portfólio mobile' }],
    quiz: [
      {
        prompt: 'O que mais impressiona num portfólio mobile?',
        options: [
          'Um app publicado numa loja, com usuários reais',
          'Muitos protótipos incompletos',
          'Screenshots de telas bonitas',
          'A lista de bibliotecas usadas',
        ],
        correctIndex: 0,
      },
    ],
  },
];

const uxui: NodeSeed[] = [
  {
    key: 'principios',
    name: 'Princípios de Design',
    category: 'FUNDAMENTOS',
    hours: 35,
    description: 'Hierarquia visual, tipografia, cor, espaçamento e composição.',
    resources: [{ label: 'Refactoring UI' }],
    quiz: [
      {
        prompt: 'Para que serve hierarquia visual numa interface?',
        options: [
          'Guiar o olhar para o que importa primeiro',
          'Deixar a tela mais colorida',
          'Reduzir o tempo de carregamento',
          'Aumentar a quantidade de conteúdo visível',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'pesquisa',
    name: 'Pesquisa com Usuários',
    category: 'CORE',
    hours: 40,
    description: 'Entrevistas, personas, jornadas e definição de problema.',
    prerequisites: ['principios'],
    resources: [{ label: 'Nielsen Norman Group', url: 'https://www.nngroup.com' }],
    quiz: [
      {
        prompt: 'Por que perguntar sobre comportamento passado é melhor que pedir opinião sobre uma ideia?',
        options: [
          'Pessoas descrevem mal o que fariam no futuro, mas lembram bem o que já fizeram',
          'Entrevistas ficam mais curtas',
          'Evita a necessidade de protótipos',
          'Garante uma amostra maior',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'prototipagem',
    name: 'Wireframes e Prototipagem',
    category: 'CORE',
    hours: 45,
    description: 'Do rascunho ao protótipo navegável no Figma.',
    prerequisites: ['pesquisa'],
    resources: [{ label: 'Figma Learn', url: 'https://help.figma.com' }],
    quiz: [
      {
        prompt: 'Por que começar por wireframe de baixa fidelidade?',
        options: [
          'Permite testar estrutura e fluxo antes de investir em acabamento visual',
          'É a única forma de validar cores',
          'Substitui a pesquisa com usuários',
          'Reduz o número de telas necessárias',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'design-system',
    name: 'Design Systems',
    category: 'FRAMEWORKS',
    hours: 40,
    description: 'Componentes reutilizáveis, tokens e consistência entre telas.',
    prerequisites: ['prototipagem'],
    resources: [{ label: 'Material Design', url: 'https://m3.material.io' }],
    quiz: [
      {
        prompt: 'Qual o principal ganho de um design system?',
        options: [
          'Consistência entre telas e menos decisão repetida a cada nova feature',
          'Telas mais bonitas',
          'Menos necessidade de pesquisa',
          'Prototipagem mais rápida apenas',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'acessibilidade',
    name: 'Acessibilidade e Testes de Usabilidade',
    category: 'AVANCADO',
    hours: 35,
    description: 'WCAG, contraste, navegação por teclado e testes com usuários.',
    prerequisites: ['design-system'],
    resources: [{ label: 'WCAG', url: 'https://www.w3.org/WAI/standards-guidelines/wcag' }],
    quiz: [
      {
        prompt: 'Por que contraste suficiente entre texto e fundo é obrigatório em acessibilidade?',
        options: [
          'Sem ele, pessoas com baixa visão não conseguem ler o conteúdo',
          'Melhora o desempenho da página',
          'Reduz o consumo de bateria',
          'Facilita a exportação do arquivo',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'carreira',
    name: 'Portfólio e Estudos de Caso',
    category: 'CARREIRA',
    hours: 25,
    description: 'Estudos de caso que mostram processo, não só o resultado final.',
    prerequisites: ['acessibilidade'],
    resources: [{ label: 'Guia de portfólio UX' }],
    quiz: [
      {
        prompt: 'O que um bom estudo de caso de UX precisa mostrar?',
        options: [
          'O problema, as decisões tomadas e por quê — não apenas as telas finais',
          'A maior quantidade possível de telas',
          'As ferramentas utilizadas',
          'O tempo gasto no projeto',
        ],
        correctIndex: 0,
      },
    ],
  },
];

/** Chaveado pelo `slug` da carreira (forma curta). */
export const ROADMAPS: Record<string, NodeSeed[]> = {
  frontend,
  backend,
  'data-science': dataScience,
  devops,
  mobile,
  'ux-ui': uxui,
};
