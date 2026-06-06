import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  beforeEach(() => {
    // swallow jsdom's "navigation not implemented" noise from the mailto: fallback
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('associates labels with inputs', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'cf-name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'cf-email');
    expect(screen.getByLabelText('Message')).toHaveAttribute('id', 'cf-message');
  });

  it('guards an empty message', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/add a short message/i);
  });

  it('sends through the contact API and confirms', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Message'), 'Hello there, want to collaborate.');
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('falls back to a mailto draft when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Message'), 'Hello there, want to collaborate.');
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/opening your email app/i)).toBeInTheDocument();
  });
});
