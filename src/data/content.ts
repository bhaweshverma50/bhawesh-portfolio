import type { EducationItem, ExperienceItem, Fact, HeadlineLine, MarqueeItem, SkillGroup } from '../types';

/* ============================================================
   All site copy lives here — edit text without touching components.
   ============================================================ */

/** Hero (home) */
export const HERO = {
  metaRole: 'Senior Software Engineer',
  metaLine:
    'Distributed systems, event-driven pipelines, and RAG. 4+ years shipping production backends.',
  status: 'Senior SWE @ Sanas AI, Bangalore, IN',
  headline: [
    { text: 'Bhawesh' },
    { text: 'builds', outline: true },
    { text: 'AI systems', rotate: ['pipelines', 'native apps', 'voice tech'] },
  ] as HeadlineLine[],
  sub:
    'Senior software engineer specialising in distributed systems, AI orchestration, and RAG. I build production-grade backends in Python & TypeScript that process millions of events daily.',
  scrollCue: 'Scroll to explore',
};

/** About (home) */
export const ABOUT = {
  num: '(01)',
  title: 'About',
  eyebrow: 'Who I am',
  lead:
    "I'm Bhawesh, a senior software engineer who lives at the seam between raw data engineering and frontier AI model training. I like owning systems end-to-end in fast-paced environments, from the orchestration layer down to the infra.",
  body: [
    'Over <b>4+ years</b> I’ve built production-grade backends in <b>Python &amp; TypeScript</b> that process millions of events daily: Kafka-backed pipelines, Kubernetes-based high-throughput ingestion, agentic workflows, and RAG wired into real products.',
    'I’m at my best taking an ambiguous problem to a <b>sharp, shipped POC</b>. That means architecting the system, integrating LLMs and vector stores, and tuning the inference path until it’s fast enough to feel instant.',
  ],
};

export const FACTS: Fact[] = [
  { k: 'Experience', v: '4+ Years' },
  { k: 'Focus', v: 'AI Systems' },
  { k: 'Now', v: 'Sanas AI' },
  { k: 'Based in', v: 'Bangalore, IN' },
];

export const MARQUEE: MarqueeItem[] = [
  { label: 'Python', hot: true },
  { label: 'TypeScript' },
  { label: 'FastAPI', hot: true },
  { label: 'React' },
  { label: 'RAG', hot: true },
  { label: 'LangGraph' },
  { label: 'Kafka', hot: true },
  { label: 'Kubernetes' },
  { label: 'Triton', hot: true },
  { label: 'PostgreSQL', hot: true },
  { label: 'Vector DBs' },
  { label: 'AWS' },
  { label: 'Go' },
];

/** Experience (work page) */
export const EXPERIENCE: ExperienceItem[] = [
  {
    when: 'Feb 2025 — Now',
    role: 'Senior Software Engineer',
    co: 'Sanas AI',
    desc: 'Build Kafka, RabbitMQ, and Celery pipelines moving millions of events a day, plus a Kubernetes recording microservice for continuous audio ingestion. Shipped a Chrome extension replicating the desktop app in-browser: virtual-microphone injection, voice-gateway routing, OAuth licensing, and ClickHouse-backed observability. Own metrics dashboards, SLOs, and feature-flagged rollouts.',
    place: 'Bangalore, India (Hybrid)',
  },
  {
    when: 'Jan 2024 — Feb 2025',
    role: 'Software Engineer',
    co: 'Terawe Corporation',
    desc: 'Engineered a modular multi-modal pre-processor (ffmpeg transcoding, frame extraction, OCR) vectorizing tens of thousands of documents into VectorDBs for large-scale RAG, and shipped conversational-agent platforms for ITER & NYPD with high-accuracy citation integrity.',
    place: 'Bangalore, India (Hybrid)',
  },
  {
    when: 'Nov 2021 — Nov 2023',
    role: 'Software Engineer',
    co: 'USEReady',
    desc: 'Took a core product from POC to production in 6 months, scaling to support an 80% increase in customer acquisition, and built internal automation that lifted organizational productivity by 60%.',
    place: 'Bangalore, India',
  },
];

/** Stack (work page) — listed without skill-level badges */
export const SKILLS: SkillGroup[] = [
  { cat: 'Systems & Backend', items: ['Python (FastAPI, Django)', 'TypeScript', 'Node.js', 'Go', 'Kafka / RabbitMQ / Celery', 'ffmpeg & media pipelines', 'Distributed workflows'] },
  { cat: 'Frontend', items: ['React', 'Next.js', 'Zustand', 'Tailwind CSS', 'Chrome Extensions', 'TypeScript'] },
  { cat: 'AI Orchestration', items: ['LLM APIs (OpenAI, Claude, Gemini)', 'LangGraph / LangChain', 'RAG pipelines', 'MCP', 'Triton Inference Server', 'Prompt engineering'] },
  { cat: 'Data Layers', items: ['PostgreSQL', 'Supabase', 'ClickHouse', 'Elasticsearch / OpenSearch', 'Vector DBs (Pinecone, Qdrant, Weaviate, Chroma)', 'Neo4j', 'Redis'] },
  { cat: 'Infrastructure', items: ['AWS (Lambda, S3, EC2)', 'GCP (Cloud Run, Functions, Vertex)', 'Kubernetes', 'Docker', 'CI/CD', 'Feature flags & A/B'] },
  { cat: 'Mobile / Desktop', items: ['React Native', 'Electron', 'Swift (macOS, iOS)', 'Core ML'] },
];

/** Education & awards (work page) */
export const EDUCATION: EducationItem[] = [
  { degree: 'B.Tech in Computer Science', school: 'SVIST', when: '2017 — 2021', note: 'GPA: A' },
];

export const AWARDS: string[] = [
  'Quarterly Team Award, Terawe (2024)',
  '3× Performance Awards (USEReady)',
];

/** Standalone page intros */
export const PAGES = {
  work: {
    eyebrow: 'Selected work, 2021—2026',
    title: 'Work',
    lead:
      "Systems I've architected and shipped end-to-end: production AI infra, agentic products, and native apps. A few are open-source; others shipped inside fast-moving teams.",
  },
  blog: {
    eyebrow: 'Notes & essays',
    title: 'Writing',
    lead: '<b>Thinking out loud about craft, systems, and shipping AI.</b> Mostly the stuff I wish someone had told me earlier.',
    empty: 'Essays are on the way. Check back soon.',
  },
};

/** CTA block (home) + Contact page copy */
export const CTA = {
  eyebrow: "Let's build",
  titleLines: ['START A', 'PROJECT ↗︎'],
  footerNote: 'Designed & built with intent',
};

export const CONTACT = {
  eyebrow: "Let's build",
  titleLines: ['SAY', 'HELLO ↗︎'],
  formNum: '(01)',
  formTitle: 'Or drop a line',
  formEyebrow: 'I reply within a day',
};
