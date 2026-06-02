import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from './Nav';
import { hasPosts } from '../data/posts';

describe('Nav', () => {
  it('renders the brand and primary links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Nav />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /bhawesh/i })).toBeInTheDocument();
    // Work appears in both the desktop nav and the mobile menu
    expect(screen.getAllByRole('link', { name: 'Work' }).length).toBeGreaterThanOrEqual(1);
  });

  it('marks the active route', () => {
    render(
      <MemoryRouter initialEntries={['/work']}>
        <Nav />
      </MemoryRouter>,
    );
    screen.getAllByRole('link', { name: 'Work' }).forEach((a) => expect(a).toHaveClass('active'));
  });

  it('marks Work active on a project detail route', () => {
    render(
      <MemoryRouter initialEntries={['/project/synthwave']}>
        <Nav />
      </MemoryRouter>,
    );
    screen.getAllByRole('link', { name: 'Work' }).forEach((a) => expect(a).toHaveClass('active'));
  });

  it('shows the Writing link when (and only when) posts exist', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Nav />
      </MemoryRouter>,
    );
    const writing = screen.queryAllByRole('link', { name: 'Writing' });
    if (hasPosts()) {
      expect(writing.length).toBeGreaterThanOrEqual(1);
    } else {
      expect(writing.length).toBe(0);
    }
  });
});
