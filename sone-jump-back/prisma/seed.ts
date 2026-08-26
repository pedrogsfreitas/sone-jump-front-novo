import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient } from '../generated/prisma/client';
import { encryptCpf, hashCpf } from '../src/common/crypto/cpf.util';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ADMIN_SEED = {
  email: 'admin@jump.local',
  username: 'admin',
  password: 'AdminSeed123',
  fullName: 'Admin JUMP',
  cpf: '98765432100',
  phone: '11900000000',
};

const SKILLS = [
  'HTML/CSS',
  'Responsividade',
  'JavaScript',
  'Git/GitHub',
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
];

const ROADMAP_NODES: Array<{
  id: string;
  name: string;
  category: 'FUNDAMENTOS' | 'CORE' | 'FRAMEWORKS' | 'AVANCADO' | 'CARREIRA';
  hours: number;
  description: string;
  skill?: string;
  /** Pré-requisitos são N:N: o nó só abre quando TODOS estiverem concluídos. */
  prerequisites?: string[];
  resources: Array<{ label: string; url?: string }>;
}> = [
  {
    id: 'html-css',
    name: 'HTML/CSS',
    category: 'FUNDAMENTOS',
    hours: 40,
    description: 'Fundação da web: estrutura semântica e estilização.',
    skill: 'HTML/CSS',
    resources: [
      { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { label: 'CSS Tricks', url: 'https://css-tricks.com' },
      { label: 'Curso Alura HTML/CSS' },
    ],
  },
  {
    id: 'responsividade',
    name: 'Responsividade',
    category: 'FUNDAMENTOS',
    hours: 20,
    description: 'Layouts que se adaptam a qualquer tamanho de tela.',
    prerequisites: ['html-css'],
    resources: [{ label: 'MDN Responsive Design' }],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'CORE',
    hours: 60,
    description: 'A linguagem que dá vida à web.',
    skill: 'JavaScript',
    prerequisites: ['responsividade'],
    resources: [{ label: 'JavaScript.info' }, { label: 'Curso Alura JS' }],
  },
  {
    id: 'git',
    name: 'Git/GitHub',
    category: 'CORE',
    hours: 15,
    description: 'Controle de versão indispensável.',
    skill: 'Git/GitHub',
    prerequisites: ['javascript'],
    resources: [{ label: 'Pro Git Book' }, { label: 'GitHub Learning Lab' }],
  },
  {
    id: 'react',
    name: 'React',
    category: 'FRAMEWORKS',
    hours: 60,
    description: 'Biblioteca para interfaces reativas.',
    skill: 'React',
    prerequisites: ['git'],
    resources: [{ label: 'React Docs' }, { label: 'Rocketseat Ignite' }],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'FRAMEWORKS',
    hours: 30,
    description: 'JavaScript com tipagem estática.',
    skill: 'TypeScript',
    prerequisites: ['react'],
    resources: [{ label: 'TypeScript Handbook' }],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'AVANCADO',
    hours: 40,
    description: 'Framework React para produção.',
    skill: 'Next.js',
    prerequisites: ['typescript'],
    resources: [{ label: 'Next.js Docs' }],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'AVANCADO',
    hours: 40,
    description: 'JavaScript no servidor.',
    skill: 'Node.js',
    prerequisites: ['typescript'],
    resources: [{ label: 'Node.js Docs' }],
  },
  {
    id: 'portfolio',
    name: 'Portfólio',
    category: 'CARREIRA',
    hours: 20,
    description: 'Monte um portfólio que impressiona recrutadores.',
    prerequisites: ['nextjs'],
    resources: [{ label: 'Como Construir um Portfólio' }],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'CARREIRA',
    hours: 5,
    description: 'Otimize seu perfil para recrutadores.',
    prerequisites: ['portfolio'],
    resources: [],
  },
  {
    id: 'entrevistas',
    name: 'Entrevistas',
    category: 'CARREIRA',
    hours: 15,
    description: 'Prepare-se para entrevistas técnicas e comportamentais.',
    prerequisites: ['linkedin'],
    resources: [],
  },
];

const CATALOG_ITEMS = [
  {
    title: 'React do Zero ao Avançado com Hooks e Context',
    platform: 'UDEMY' as const,
    type: 'CURSO' as const,
    durationMinutes: 2520,
    level: 'INTERMEDIARIO' as const,
    rating: 4.8,
    description: 'Aprenda React de forma completa, do básico ao avançado.',
    thumbnailEmoji: '⚛️',
    prerequisites: ['JavaScript ES6+', 'HTML/CSS básico'],
    syllabus: [
      'Introdução ao React e JSX',
      'Componentes funcionais e props',
      'Hooks essenciais',
      'Context API',
    ],
  },
  {
    title: 'Git na prática: branches e rebase',
    platform: 'ROCKETSEAT' as const,
    type: 'VIDEO' as const,
    durationMinutes: 72,
    level: 'INICIANTE' as const,
    rating: 4.7,
    description: 'Domine os comandos de Git usados no dia a dia.',
    thumbnailEmoji: '🔧',
    prerequisites: ['Nenhum'],
    syllabus: ['Branches', 'Merge vs rebase', 'Resolvendo conflitos'],
  },
  {
    title: 'Como Construir um Portfólio que Impressiona Recrutadores',
    platform: 'YOUTUBE' as const,
    type: 'ARTIGO' as const,
    durationMinutes: 15,
    level: 'INICIANTE' as const,
    rating: 4.6,
    description: 'Quais projetos incluir e como apresentá-los.',
    thumbnailEmoji: '💼',
    prerequisites: ['Nenhum'],
    syllabus: ['Quais projetos incluir', 'Como escrever READMEs'],
  },
  {
    title: 'TypeScript do Zero ao Avançado',
    platform: 'ALURA' as const,
    type: 'CURSO' as const,
    durationMinutes: 1200,
    level: 'INTERMEDIARIO' as const,
    rating: 4.8,
    description: 'Types, generics e decorators na prática.',
    thumbnailEmoji: '🔷',
    prerequisites: ['JavaScript'],
    syllabus: ['Types básicos', 'Generics', 'Decorators'],
  },
];

const CHALLENGES = [
  {
    title: 'Criar landing page responsiva',
    difficulty: 'INICIANTE' as const,
    xpReward: 80,
    timeLabel: '2h',
    description: 'Monte uma landing page moderna e responsiva com HTML semântico e CSS.',
    skills: ['HTML/CSS'],
  },
  {
    title: 'App de tarefas com persistência local',
    difficulty: 'INTERMEDIARIO' as const,
    xpReward: 150,
    timeLabel: '5h',
    description: 'CRUD de tarefas em React com localStorage.',
    skills: ['React'],
  },
  {
    title: 'Clone do Twitter com Next.js',
    difficulty: 'AVANCADO' as const,
    xpReward: 350,
    timeLabel: '12h',
    description: 'Desenvolva um clone funcional com autenticação e feed em tempo real.',
    skills: ['Next.js', 'TypeScript'],
  },
];

const CERTIFICATIONS = [
  'HTML & CSS Fundamentals',
  'React Básico ao Avançado',
  'TypeScript Essencial',
  'Git e GitHub na Prática',
];

const PLANS: Array<{
  key: 'FREE' | 'PRO' | 'PREMIUM';
  name: string;
  priceMonthlyCents: number;
  priceAnnualCents: number;
  features: string[];
}> = [
  {
    key: 'FREE',
    name: 'Grátis',
    priceMonthlyCents: 0,
    priceAnnualCents: 0,
    features: [
      'Acesso a 3 trilhas gratuitas',
      'Até 10 exercícios por mês',
      'Fórum da comunidade',
      'Certificado básico',
      'Suporte por e-mail',
    ],
  },
  {
    key: 'PRO',
    name: 'Pro',
    priceMonthlyCents: 4900,
    priceAnnualCents: 46800,
    features: [
      'Todas as trilhas disponíveis',
      'Exercícios ilimitados',
      'Mentoria em grupo (2x/mês)',
      'Certificados verificáveis',
      'Suporte prioritário (chat)',
      'Projetos práticos guiados',
    ],
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    priceMonthlyCents: 9900,
    priceAnnualCents: 94800,
    features: [
      'Tudo do plano Pro',
      'Mentoria individual (4x/mês)',
      'Revisão de código 1:1',
      'Preparação para entrevistas',
      'Acesso a vagas exclusivas',
      'Networking com empresas parceiras',
    ],
  },
];

const GROUPS = [
  { name: 'Frontend', icon: '⚛️' },
  { name: 'Backend', icon: '🔧' },
  { name: 'Data', icon: '📊' },
  { name: 'DevOps', icon: '🚀' },
  { name: 'Mobile', icon: '📱' },
];

const PARTNERS: Array<{
  name: string;
  type: 'CONTEUDO' | 'VAGAS' | 'CERTIFICACAO' | 'API' | 'MENTORIA';
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE';
  description: string;
  since?: string;
}> = [
  {
    name: 'Alura',
    type: 'CONTEUDO',
    status: 'ATIVO',
    description: 'Plataforma líder em cursos de tecnologia no Brasil.',
    since: '2023-03-01',
  },
  {
    name: 'Gupy',
    type: 'VAGAS',
    status: 'ATIVO',
    description: 'Plataforma de recrutamento e seleção tech.',
    since: '2023-09-01',
  },
  {
    name: 'RocketSeat',
    type: 'CONTEUDO',
    status: 'ATIVO',
    description: 'Comunidade e cursos de programação.',
    since: '2023-05-01',
  },
  {
    name: 'GitHub',
    type: 'API',
    status: 'ATIVO',
    description: 'Integração de portfólio via API do GitHub.',
    since: '2024-01-01',
  },
];

const JOBS: Array<{
  title: string;
  companyName: string;
  location: string;
  remoteType: 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL';
  salaryMin: number;
  salaryMax: number;
  description: string;
  skills: string[];
  partner?: string;
}> = [
  {
    title: 'Desenvolvedor Frontend Sênior',
    companyName: 'Nubank',
    location: 'Remoto',
    remoteType: 'REMOTO',
    salaryMin: 12000,
    salaryMax: 18000,
    description: 'Construir e evoluir interfaces do app usando React e TypeScript.',
    skills: ['React', 'TypeScript'],
  },
  {
    title: 'React Developer',
    companyName: 'iFood',
    location: 'São Paulo, SP',
    remoteType: 'HIBRIDO',
    salaryMin: 8000,
    salaryMax: 14000,
    description: 'Time de plataforma de pedidos, foco em performance web.',
    skills: ['React', 'JavaScript'],
    partner: 'Gupy',
  },
  {
    title: 'Desenvolvedor Frontend Jr',
    companyName: 'Stone',
    location: 'Remoto',
    remoteType: 'REMOTO',
    salaryMin: 4000,
    salaryMax: 6000,
    description: 'Primeira oportunidade tech, mentoria incluída.',
    skills: ['HTML/CSS', 'JavaScript'],
    partner: 'Gupy',
  },
  {
    title: 'Fullstack Node.js',
    companyName: 'Mercado Livre',
    location: 'Remoto',
    remoteType: 'REMOTO',
    salaryMin: 9000,
    salaryMax: 16000,
    description: 'APIs em Node.js consumidas por front em React/Next.js.',
    skills: ['Node.js', 'React', 'Next.js'],
  },
];

const CAREERS: Array<{
  title: string;
  slug: string;
  iconKey: string;
  salaryMin: number;
  salaryMax: number;
  avgMonthsMin: number;
  avgMonthsMax: number;
  description: string;
  jobsDemandLevel: 'BAIXA' | 'MEDIA' | 'ALTA';
  difficultyLevel: 'BAIXA' | 'MEDIA' | 'ALTA';
}> = [
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    iconKey: 'monitor',
    salaryMin: 4000,
    salaryMax: 18000,
    avgMonthsMin: 8,
    avgMonthsMax: 12,
    description: 'Crie interfaces modernas e interativas para web.',
    jobsDemandLevel: 'ALTA',
    difficultyLevel: 'MEDIA',
  },
  {
    title: 'Backend Developer',
    slug: 'backend-developer',
    iconKey: 'server',
    salaryMin: 5000,
    salaryMax: 20000,
    avgMonthsMin: 8,
    avgMonthsMax: 14,
    description: 'Construa APIs e sistemas que sustentam o produto.',
    jobsDemandLevel: 'ALTA',
    difficultyLevel: 'MEDIA',
  },
  {
    title: 'Data Scientist',
    slug: 'data-scientist',
    iconKey: 'chart',
    salaryMin: 6000,
    salaryMax: 22000,
    avgMonthsMin: 12,
    avgMonthsMax: 18,
    description: 'Extraia insights e construa modelos a partir de dados.',
    jobsDemandLevel: 'MEDIA',
    difficultyLevel: 'ALTA',
  },
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    iconKey: 'git-branch',
    salaryMin: 7000,
    salaryMax: 28000,
    avgMonthsMin: 14,
    avgMonthsMax: 20,
    description: 'Automatize pipelines e gerencie infraestrutura.',
    jobsDemandLevel: 'ALTA',
    difficultyLevel: 'ALTA',
  },
  {
    title: 'Mobile Developer',
    slug: 'mobile-developer',
    iconKey: 'smartphone',
    salaryMin: 5000,
    salaryMax: 19000,
    avgMonthsMin: 8,
    avgMonthsMax: 14,
    description: 'Desenvolva aplicativos para iOS e Android.',
    jobsDemandLevel: 'MEDIA',
    difficultyLevel: 'MEDIA',
  },
  {
    title: 'UX/UI Designer',
    slug: 'ux-ui-designer',
    iconKey: 'palette',
    salaryMin: 3500,
    salaryMax: 15000,
    avgMonthsMin: 6,
    avgMonthsMax: 10,
    description: 'Projete experiências centradas no usuário.',
    jobsDemandLevel: 'MEDIA',
    difficultyLevel: 'BAIXA',
  },
];

/** A carreira dos 11 nós seedados — o roadmap de exemplo é de frontend. */
const SEED_ROADMAP_CAREER_SLUG = 'frontend-developer';

async function main() {
  const skillByName = new Map<string, number>();
  for (const name of SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillByName.set(name, skill.id);
  }

  // As carreiras vêm antes dos nós: todo RoadmapNode pertence obrigatoriamente a uma.
  for (const career of CAREERS) {
    await prisma.career.upsert({
      where: { slug: career.slug },
      update: {},
      create: career,
    });
  }

  const roadmapCareer = await prisma.career.findUniqueOrThrow({
    where: { slug: SEED_ROADMAP_CAREER_SLUG },
  });

  for (const node of ROADMAP_NODES) {
    await prisma.roadmapNode.upsert({
      where: { id: node.id },
      update: {},
      create: {
        id: node.id,
        careerId: roadmapCareer.id,
        externalKey: node.id,
        name: node.name,
        category: node.category,
        estimatedHours: node.hours,
        description: node.description,
        orderIndex: ROADMAP_NODES.indexOf(node),
        skillId: node.skill ? skillByName.get(node.skill) : undefined,
        resources: {
          create: node.resources.map((resource, i) => ({ ...resource, orderIndex: i })),
        },
      },
    });
  }

  // Depois de todos os nós existirem, senão a FK da junção quebra em quem vem antes.
  for (const node of ROADMAP_NODES) {
    for (const prerequisiteNodeId of node.prerequisites ?? []) {
      await prisma.roadmapNodePrerequisite.upsert({
        where: { nodeId_prerequisiteNodeId: { nodeId: node.id, prerequisiteNodeId } },
        update: {},
        create: { nodeId: node.id, prerequisiteNodeId },
      });
    }
  }

  for (const item of CATALOG_ITEMS) {
    const exists = await prisma.contentItem.findFirst({ where: { title: item.title } });
    if (exists) continue;
    await prisma.contentItem.create({
      data: {
        title: item.title,
        platform: item.platform,
        type: item.type,
        durationMinutes: item.durationMinutes,
        level: item.level,
        rating: item.rating,
        description: item.description,
        thumbnailEmoji: item.thumbnailEmoji,
        prerequisites: { create: item.prerequisites.map((label) => ({ label })) },
        syllabus: {
          create: item.syllabus.map((title, orderIndex) => ({ title, orderIndex })),
        },
      },
    });
  }

  for (const challenge of CHALLENGES) {
    const exists = await prisma.challenge.findFirst({ where: { title: challenge.title } });
    if (exists) continue;
    await prisma.challenge.create({
      data: {
        title: challenge.title,
        difficulty: challenge.difficulty,
        xpReward: challenge.xpReward,
        timeLabel: challenge.timeLabel,
        description: challenge.description,
        tags: {
          create: challenge.skills
            .map((name) => skillByName.get(name))
            .filter((id): id is number => id !== undefined)
            .map((skillId) => ({ skillId })),
        },
      },
    });
  }

  for (const name of CERTIFICATIONS) {
    await prisma.certification.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const plan of PLANS) {
    await prisma.plan.upsert({ where: { key: plan.key }, update: {}, create: plan });
  }

  for (const group of GROUPS) {
    await prisma.group.upsert({ where: { name: group.name }, update: {}, create: group });
  }

  const partnerByName = new Map<string, number>();
  for (const partner of PARTNERS) {
    const exists = await prisma.partner.findFirst({ where: { name: partner.name } });
    const saved =
      exists ??
      (await prisma.partner.create({
        data: {
          name: partner.name,
          type: partner.type,
          status: partner.status,
          description: partner.description,
          since: partner.since ? new Date(partner.since) : undefined,
        },
      }));
    partnerByName.set(partner.name, saved.id);
  }

  for (const job of JOBS) {
    const exists = await prisma.job.findFirst({ where: { title: job.title, companyName: job.companyName } });
    if (exists) continue;
    await prisma.job.create({
      data: {
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        remoteType: job.remoteType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        description: job.description,
        partnerId: job.partner ? partnerByName.get(job.partner) : undefined,
        skills: {
          create: job.skills
            .map((name) => skillByName.get(name))
            .filter((id): id is number => id !== undefined)
            .map((skillId) => ({ skillId })),
        },
      },
    });
  }

  const cpfHmacSecret = process.env.CPF_HMAC_SECRET;
  const cpfEncKey = process.env.CPF_ENC_KEY;
  if (cpfHmacSecret && cpfEncKey) {
    const adminExists = await prisma.user.findUnique({ where: { username: ADMIN_SEED.username } });
    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: ADMIN_SEED.email,
          username: ADMIN_SEED.username,
          passwordHash: await argon2.hash(ADMIN_SEED.password, { type: argon2.argon2id }),
          fullName: ADMIN_SEED.fullName,
          cpfHash: hashCpf(ADMIN_SEED.cpf, cpfHmacSecret),
          cpfEncrypted: encryptCpf(ADMIN_SEED.cpf, cpfEncKey),
          phone: ADMIN_SEED.phone,
          role: 'ADMIN',
        },
      });
      console.log(`Admin de teste criado: ${ADMIN_SEED.username} / ${ADMIN_SEED.password}`);
    }
  }

  const RECORDINGS = [
    {
      title: 'Git na prática: branches e rebase',
      videoUrl: 'https://example.com/recordings/git-na-pratica',
      viewCount: 8400,
      durationMinutes: 72,
    },
    {
      title: 'Zustand vs Redux: qual usar?',
      videoUrl: 'https://example.com/recordings/zustand-vs-redux',
      viewCount: 6100,
      durationMinutes: 58,
    },
  ];
  for (const recording of RECORDINGS) {
    const exists = await prisma.recording.findFirst({ where: { title: recording.title } });
    if (!exists) await prisma.recording.create({ data: recording });
  }

  console.log('Seed concluído.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
