import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  beforeEach(() => {
    // swallow jsdom's "navigation not implemented" noise from the mailto: assignment
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

  it('confirms after composing an email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Message'), 'Hello there, want to collaborate.');
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/opening your email app/i);
  });
});
