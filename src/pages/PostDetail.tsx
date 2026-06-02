import { Link, useParams } from 'react-router-dom';
import { POSTS } from '../data/posts';
import { Placeholder } from '../components/Placeholder';
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
          ← All writing
        </Link>
        <header className="post-head">
          <span className="eyebrow">
            {p.tag} · {p.read} read
          </span>
          <h1 className="post-title reveal">{p.title}</h1>
          <TitleUnderline />
          <div className="post-byline reveal reveal-d1">Bhawesh · {p.date}</div>
        </header>
        <div className="post-cover reveal reveal-d1">
          <Placeholder label="article cover" alt={`Cover image for “${p.title}”`} />
        </div>
        <div className="post-body reveal">
          {p.body.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
        <Link className="back big" to="/blog">
          ← Back to writing
        </Link>
      </div>
    </article>
  );
}
