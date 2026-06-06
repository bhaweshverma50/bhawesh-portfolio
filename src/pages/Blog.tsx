import { Link } from 'react-router-dom';
import { TitleUnderline } from '../components/TitleUnderline';
import { RichText } from '../components/RichText';
import { PAGES } from '../data/content';
import { POSTS, POST_ORDER, hasPosts } from '../data/posts';

export function Blog() {
  return (
    <>
      <section className="page-hero" data-screen-label="Writing">
        <div className="wrap">
          <span className="eyebrow">{PAGES.blog.eyebrow}</span>
          <h1>{PAGES.blog.title}</h1>
          <TitleUnderline />
          <RichText className="lead" html={PAGES.blog.lead} />
        </div>
      </section>
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {hasPosts() ? (
            <div className="writing">
              {POST_ORDER.map((slug) => {
                const p = POSTS[slug];
                return (
                  <Link className="post" to={`/post/${p.slug}`} key={p.slug}>
                    <span className="pdate">
                      {p.displayDate} / {p.tag}
                    </span>
                    <span className="ptitle">
                      {p.title}
                      {p.summary && <span className="psum">{p.summary}</span>}
                    </span>
                    <span className="pread">{p.read} {'→︎'}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="lead" style={{ color: 'var(--muted)' }}>
              {PAGES.blog.empty}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
