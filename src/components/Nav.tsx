import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClock } from '../hooks/useClock';
import { routeKeyOf } from '../lib/route';
import { SITE } from '../config/site';
import { hasPosts } from '../data/posts';

export function Nav() {
  const { pathname } = useLocation();
  const key = routeKeyOf(pathname);
  const clock = useClock();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/work', label: 'Work', key: 'work' },
    ...(hasPosts() ? [{ to: '/blog', label: 'Writing', key: 'blog' }] : []),
    { to: '/contact', label: 'Contact', key: 'contact' },
  ];

  const isActive = (k: string) =>
    key === k || (key === 'project' && k === 'work') || (key === 'post' && k === 'blog');

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">
          <span className="dot" />
          {SITE.firstName.toUpperCase()}
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={isActive(l.key) ? 'active' : undefined} aria-current={isActive(l.key) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="clock">{clock}</div>
        <button
          className="nav-toggle"
          id="navToggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobileMenu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </header>

      <div className="mobile-menu" id="mobileMenu">
        <Link to="/" className={`mm-link${key === 'home' ? ' active' : ''}`}>Home</Link>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={`mm-link${isActive(l.key) ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
        <span className="mm-foot">{clock}</span>
      </div>
    </>
  );
}
