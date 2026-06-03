import { Link, useParams } from 'react-router-dom';
import { POSTS } from '../data/posts';
import { TitleUnderline } from '../components/TitleUnderline';
import { NotFound } from './NotFound';

export function PostDetail() {
  const { slug } = useParams();
  const p = slug ? POSTS[slug] : undefined;
  if (!p) return <NotFound label="Post not found" />;

  return (
    <article className="post-detail" data-screen-label={`Post · ${p.title}`}>
      <div className="wrap narrow">
        <Link className="back" to="/blog">
          {'←︎'} All writing
        </Link>
        <header className="post-head">
          <span className="eyebrow">
            {p.tag} · {p.read} read
          </span>
          <h1 className="post-title reveal">{p.title}</h1>
          <TitleUnderline />
          <div className="post-byline reveal reveal-d1">Bhawesh · {p.displayDate}</div>
        </header>
        {p.cover && (
          <div className="post-cover reveal reveal-d1">
            <img src={p.cover} alt={`Cover for “${p.title}”`} loading="lazy" />
          </div>
        )}
        <div className="post-body reveal" dangerouslySetInnerHTML={{ __html: p.html }} />
        {p.links && p.links.length > 0 && (
          <div className="post-links reveal">
            {p.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} {'↗︎'}
              </a>
            ))}
          </div>
        )}
        <Link className="back big" to="/blog">
          {'←︎'} Back to writing
        </Link>
      </div>
    </article>
  );
}
