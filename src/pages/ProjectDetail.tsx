import { Link, useParams } from 'react-router-dom';
import { PROJECTS, nextProjectSlug } from '../data/projects';
import { Placeholder, TagList } from '../components/Placeholder';
import { TitleUnderline } from '../components/TitleUnderline';
import { NotFound } from './NotFound';
import type { ProjectMedia } from '../types';

/** Render a single piece of project media — a looping muted video, or a (lazy) image/gif. */
function Media({ media, lazy }: { media: ProjectMedia; lazy?: boolean }) {
  if (media.type === 'video') {
    return <video src={media.src} muted loop playsInline autoPlay aria-label={media.alt} />;
  }
  return <img src={media.src} alt={media.alt} {...(lazy ? { loading: 'lazy' } : {})} />;
}

export function ProjectDetail() {
  const { slug } = useParams();
  const p = slug ? PROJECTS[slug] : undefined;
  if (!p) return <NotFound label="Project not found" />;
  const nx = PROJECTS[nextProjectSlug(p.slug)];

  return (
    <article className="detail" data-screen-label={`Project: ${p.name}`}>
      <div className="wrap">
        <Link className="back" to="/work">
          {'←︎'} All work
        </Link>
        <header className="detail-head">
          <span className="eyebrow">Project, {p.year}</span>
          <h1 className="detail-title reveal">{p.name}</h1>
          <TitleUnderline />
          <p className="detail-tag reveal reveal-d1">{p.tagline}</p>
          {(p.demo || p.repo || p.writeup) && (
            <div className="reveal reveal-d1" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
              {p.demo && (
                <a className="btn solid" href={p.demo} target="_blank" rel="noopener noreferrer">
                  <span>Live demo {'↗︎'}</span>
                </a>
              )}
              {p.repo && (
                <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer">
                  <span>View source {'↗︎'}</span>
                </a>
              )}
              {p.writeup && (
                <Link className="btn" to={p.writeup}>
                  <span>Read the write-up {'→︎'}</span>
                </Link>
              )}
            </div>
          )}
        </header>
        <div className="detail-meta reveal reveal-d1">
          <div>
            <span className="k">Year</span>
            <span className="v">{p.year}</span>
          </div>
          <div>
            <span className="k">Role</span>
            <span className="v">{p.role}</span>
          </div>
          <div className="stackcell">
            <span className="k">Stack</span>
            <TagList tags={p.stack} />
          </div>
        </div>
        <div className="detail-hero reveal reveal-d2">
          {p.hero ? (
            <Media media={p.hero} />
          ) : (
            <Placeholder label={`${p.tagline} (hero shot)`} alt={`${p.name}: ${p.tagline}`} />
          )}
        </div>
        <p className="detail-lead reveal">{p.lead}</p>
        <div className="metrics reveal">
          {p.metrics.map((m) => (
            <div className="metric" key={m[1]}>
              <div className="num">{m[0]}</div>
              <div className="lbl">{m[1]}</div>
            </div>
          ))}
        </div>
        <div className="detail-grid">
          <div className="detail-body reveal">
            {p.body.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          <div className="detail-features reveal reveal-d1">
            <h4>Highlights</h4>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
        {p.gallery?.length ? (
          <div className="detail-gallery reveal">
            {p.gallery.map((m, i) => (
              <figure className={'shot' + (i === 0 ? ' shot-lead' : '')} key={m.src}>
                <Media media={m} lazy />
                {m.caption && <figcaption>{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        ) : (
          <div className="detail-shots reveal">
            <Placeholder label="detail shot 01" alt={`${p.name} screenshot 1`} />
            <Placeholder label="detail shot 02" alt={`${p.name} screenshot 2`} />
          </div>
        )}
        {nx && (
          <Link className="next-proj" to={`/project/${nx.slug}`}>
            <span className="np-k">Next project</span>
            <span className="np-name">{nx.name} {'→︎'}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
