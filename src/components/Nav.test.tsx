import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from './Nav';

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
});
