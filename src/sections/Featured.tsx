import { Link } from 'react-router-dom';
import { featuredProjects } from '../data/projects';

export function Featured() {
  const items = featuredProjects();
  return (
    <section className="block" id="featured" data-screen-label="Featured">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="sec-num">(02)</span>
          <h2 className="sec-title">Selected Work</h2>
          <Link className="eyebrow" to="/work">
            All work {'→︎'}
          </Link>
        </div>
        <div className="feat">
          {items.map((p, i) => (
            <Link className="feat-item" to={`/project/${p.slug}`} data-preview={p.preview} {...(p.thumb ? { 'data-preview-img': p.thumb } : {})} {...(p.thumbAspect ? { 'data-preview-aspect': p.thumbAspect } : {})} key={p.slug}>
              <span className="fnum">{String(i + 1).padStart(2, '0')}</span>
              <span className="feat-name">{p.name}</span>
              <span className="feat-meta">
                <span className="feat-desc">{p.tagline}</span>
                <span className="feat-tags">
                  {p.cardTags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </span>
              </span>
              <span className="feat-arrow">{'↗︎'}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
