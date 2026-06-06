import { SITE } from '../config/site';

const RESUME_TEXT = `BHAWESH VERMA | Senior Software Engineer
Bangalore, India | bhaweshverma50@gmail.com | bhaweshv.vercel.app

Senior Software Engineer at Sanas AI (Feb 2025 to now): Kafka/RabbitMQ pipelines at millions of events daily, Kubernetes audio ingestion, Chrome extension voice platform, ClickHouse observability.

Software Engineer at Terawe (2024 to 2025): multi-modal RAG pipelines (ffmpeg, OCR), conversational agents for ITER and NYPD.

Software Engineer at USEReady (2021 to 2023): B2B analytics product POC to production, internal automation.

Projects: SpaceLens (macOS disk analyzer, local AI), Perch (Dynamic Island for the MacBook notch), Validatyr (multi-agent app-idea validation), Crochet by Shivani (live e-commerce, Razorpay).

B.Tech Computer Science, SVIST, 2017 to 2021.
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
      <span>Download Résumé {'↓︎'}</span>
    </button>
  );
}
