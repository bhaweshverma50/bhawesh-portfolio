import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { THEMES, TRANSITION_SPEED_MS } from './config/themes';
import { routeKeyOf, slugOf } from './lib/route';
import type { RouteKey } from './types';
import { useTweaks } from './components/tweaks/TweaksContext';
import { useReveal } from './hooks/useReveal';
import { Overlays } from './components/Overlays';
import { Cursor } from './components/Cursor';
import { FxLayer } from './components/FxLayer';
import { FeaturePreview } from './components/FeaturePreview';
import { Nav } from './components/Nav';
import { SectionRail } from './components/SectionRail';
import { TweaksPanel } from './components/tweaks/TweaksPanel';
import { TweaksFab } from './components/tweaks/TweaksFab';
import { Home } from './pages/Home';
import { Work } from './pages/Work';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { ProjectDetail } from './pages/ProjectDetail';
import { PostDetail } from './pages/PostDetail';
import { NotFound } from './pages/NotFound';
import { PROJECTS } from './data/projects';
import { POSTS } from './data/posts';
import { SITE } from './config/site';

type Phase = 'idle' | 'cover' | 'out' | 'reset';

function applyTheme(key: RouteKey) {
  const t = THEMES[key] ?? THEMES.home;
  const s = document.documentElement.style;
  s.setProperty('--accent', t.accent);
  s.setProperty('--bg', t.bg);
  s.setProperty('--bg-2', t.bg2);
  s.setProperty('--bg-3', t.bg3);
  document.body.setAttribute('data-page', key);
}

function setDocTitle(key: RouteKey, slug?: string) {
  const b = SITE.firstName;
  let title: string = SITE.title;
  if (key === 'project') title = (slug && PROJECTS[slug] ? PROJECTS[slug].name : 'Project') + ` | ${b}`;
  else if (key === 'post') title = (slug && POSTS[slug] ? POSTS[slug].title : 'Writing') + ` | ${b}`;
  else if (key === 'work') title = `Work | ${b}`;
  else if (key === 'blog') title = `Writing | ${b}`;
  else if (key === 'contact') title = `Contact | ${b}`;
  document.title = title;
}

export function App() {
  const location = useLocation();
  const { tweaks } = useTweaks();
  const [displayed, setDisplayed] = useState(location);
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  const targetKey = routeKeyOf(location.pathname);
  const targetTheme = THEMES[targetKey] ?? THEMES.home;
  const dur = TRANSITION_SPEED_MS[tweaks.transSpeed] ?? 520;

  // theme + title follow the *displayed* route, so they flip at swap time (mid-wipe)
  useEffect(() => {
    const key = routeKeyOf(displayed.pathname);
    applyTheme(key);
    setDocTitle(key, slugOf(displayed.pathname));
  }, [displayed]);

  // reveal animations re-arm after each content swap
  useReveal(displayed.pathname);

  // barba-style wipe: cover → swap content → reveal → snap back
  useEffect(() => {
    if (location.pathname === displayed.pathname) return;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setPhase('cover');
    timers.current.push(
      window.setTimeout(() => {
        setDisplayed(location);
        window.scrollTo(0, 0);
        setPhase('out');
      }, Math.round(dur * 0.92)),
    );
    timers.current.push(
      window.setTimeout(() => {
        setPhase('reset');
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase('idle')));
      }, Math.round(dur * 1.92)),
    );
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const onSkip = (e: MouseEvent) => {
    e.preventDefault();
    const v = document.getElementById('view');
    if (v) {
      v.setAttribute('tabindex', '-1');
      v.focus();
      v.scrollIntoView();
    }
  };

  const ptClass =
    `pt-${tweaks.transition}` +
    (phase === 'cover' ? ' cover' : phase === 'out' ? ' out' : phase === 'reset' ? ' noanim' : '');

  const isHome = routeKeyOf(displayed.pathname) === 'home';

  return (
    <>
      <a href="#view" className="skip-link" onClick={onSkip}>
        Skip to content
      </a>

      <Overlays />
      <Cursor />
      <FxLayer />
      <FeaturePreview />

      <div
        id="pt"
        className={ptClass}
        style={{ '--pt-color': targetTheme.accent, '--pt-dur': `${dur}ms` } as CSSProperties}
      >
        <span className="pt-name">{targetTheme.label}</span>
      </div>

      {isHome && <SectionRail />}
      <Nav />

      <main id="view">
        <Routes location={displayed}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <TweaksPanel />
      <TweaksFab />
    </>
  );
}
