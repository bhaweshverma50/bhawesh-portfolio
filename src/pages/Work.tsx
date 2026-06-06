import { Link } from 'react-router-dom';
import { TitleUnderline } from '../components/TitleUnderline';
import { RichText } from '../components/RichText';
import { ContributionGraph } from '../components/ContributionGraph';
import { AWARDS, EDUCATION, EXPERIENCE, PAGES, SKILLS } from '../data/content';
import { orderedProjects } from '../data/projects';
import { GITHUB_USER, REPOS } from '../data/github';

export function Work() {
  const projects = orderedProjects();
  return (
    <>
      <section className="page-hero" data-screen-label="Work">
        <div className="wrap">
          <span className="eyebrow">{PAGES.work.eyebrow}</span>
          <h1>{PAGES.work.title}</h1>
          <TitleUnderline />
          <RichText className="lead" html={PAGES.work.lead} />
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }} data-screen-label="Projects">
        <div className="wrap">
          <div className="proj-grid">
            {projects.map((p, i) => (
              <Link className="proj-card" to={`/project/${p.slug}`} data-preview={p.preview} {...(p.thumb ? { 'data-preview-img': p.thumb } : {})} {...(p.thumbAspect ? { 'data-preview-aspect': p.thumbAspect } : {})} key={p.slug}>
                <span className="pc-num">{`${String(i + 1).padStart(2, '0')} / ${p.category}`}</span>
                <span className="pc-name">{p.name}</span>
                <span className="pc-tag">{p.tagline}</span>
                <span className="pc-foot">
                  <span className="feat-tags">
                    {p.cardTags.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </span>
                  <span className="pc-arrow">{'↗︎'}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="block" data-screen-label="Experience">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-num">(02)</span>
            <h2 className="sec-title">Experience</h2>
            <span className="eyebrow">The path</span>
          </div>
          <div className="timeline">
            {EXPERIENCE.map((e) => (
              <div className="tl-item reveal" key={e.co}>
                <span className="tl-when">{e.when}</span>
                <span>
                  <span className="tl-role">{e.role}</span>
                  <div className="tl-co">{e.co}</div>
                  <p className="tl-desc">{e.desc}</p>
                </span>
                <span className="tl-place">{e.place}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" data-screen-label="Stack">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-num">(03)</span>
            <h2 className="sec-title">Stack</h2>
            <span className="eyebrow">Tools of the trade</span>
          </div>
          <div className="skills-grid reveal">
            {SKILLS.map((cat) => (
              <div className="skill-cat" key={cat.cat}>
                <h4>{cat.cat}</h4>
                <ul>
                  {cat.items.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" data-screen-label="Open Source">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-num">(04)</span>
            <h2 className="sec-title">Open Source</h2>
            <a className="eyebrow" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer">
              Building in public {'↗︎'}
            </a>
          </div>
          <ContributionGraph user={GITHUB_USER} />
          <div className="repos reveal reveal-d2">
            {REPOS.map((r) => (
              <a className="repo" key={r.name} href={r.url} target="_blank" rel="noopener noreferrer">
                <div className="rtop">
                  <span className="rname">{r.name}</span>
                </div>
                <div className="rdesc">{r.desc}</div>
                <div className="rmeta">
                  <span className="lang">{r.lang}</span>
                  {r.stars > 0 && <span>★ {r.stars}</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="block" data-screen-label="Education">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-num">(05)</span>
            <h2 className="sec-title">Education &amp; Awards</h2>
            <span className="eyebrow">The foundations</span>
          </div>
          <div className="timeline">
            {EDUCATION.map((e) => (
              <div className="tl-item reveal" key={e.degree}>
                <span className="tl-when">{e.when}</span>
                <span>
                  <span className="tl-role">{e.degree}</span>
                  <div className="tl-co">
                    {e.school}
                    {e.note ? `, ${e.note}` : ''}
                  </div>
                </span>
                <span className="tl-place" />
              </div>
            ))}
          </div>
          {AWARDS.length > 0 && (
            <div className="reveal reveal-d1" style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span className="eyebrow">Recognition</span>
              <div className="feat-tags">
                {AWARDS.map((a) => (
                  <span className="tag" key={a}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
