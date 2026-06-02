import { SITE } from '../config/site';

const RESUME_TEXT = `BHAWESH — Full-Stack Software Engineer

4 years of experience. Creative full-stack engineer with a strong UI/UX sense and a focus on feature & POC analysis and development.

STACK
Frontend: React, Next.js, TypeScript, Motion/GSAP, WebGL
Backend: Node.js, Go, PostgreSQL, Redis, tRPC
Craft: UI/UX, Prototyping, POC analysis, Docker/CI, AWS

SELECTED WORK
• Synthwave — realtime collaborative editor (CRDT, WebSockets)
• Cortex — self-hostable AI knowledge base (pgvector, LLM)
• Pulse — engineering metrics dashboard (Go, TimescaleDB)
• Flux Field — WebGL generative-art playground

CONTACT
${SITE.email}
`;

/** Downloads a real résumé file when SITE.resumeUrl is set, else a text fallback. */
export function ResumeButton() {
  const onClick = () => {
    if (SITE.resumeUrl) {
      const a = document.createElement('a');
      a.href = SITE.resumeUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.download = '';
      a.click();
      return;
    }
    const url = URL.createObjectURL(new Blob([RESUME_TEXT], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bhawesh-Resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button className="btn js-resume" type="button" onClick={onClick}>
      <span>Download Résumé ↓</span>
    </button>
  );
}
