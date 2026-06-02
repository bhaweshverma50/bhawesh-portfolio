import { ABOUT, FACTS } from '../data/content';
import { RichText } from '../components/RichText';

export function About() {
  return (
    <section className="block" id="about" data-screen-label="About">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="sec-num">{ABOUT.num}</span>
          <h2 className="sec-title">{ABOUT.title}</h2>
          <span className="eyebrow">{ABOUT.eyebrow}</span>
        </div>
        <div className="about-grid">
          <RichText className="about-lead reveal" html={ABOUT.lead} />
          <div className="about-body reveal reveal-d1">
            {ABOUT.body.map((p, i) => (
              <RichText key={i} html={p} />
            ))}
            <div className="facts">
              {FACTS.map((f) => (
                <div className="fact" key={f.k}>
                  <div className="k">{f.k}</div>
                  <div className="v">{f.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
