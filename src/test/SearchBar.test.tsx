import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../components/molecules/SearchBar';

describe('SearchBar', () => {
  it('renders an input with aria-label for search', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    const input = screen.getByRole('textbox', {
      name: /buscar transacciones/i,
    });
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch with the typed value when user types', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: /buscar transacciones/i });

    await userEvent.type(input, 'JUMBO');

    expect(onSearch).toHaveBeenCalledWith('J');
    expect(onSearch).toHaveBeenLastCalledWith('JUMBO');
  });

  it('does not show clear button when input is empty', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();
  });

  it('shows clear button when input has text', async () => {
    render(<SearchBar onSearch={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /buscar transacciones/i });

    await userEvent.type(input, 'test');

    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument();
  });

  it('clears input and calls onSearch with empty string when clear button is clicked', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: /buscar transacciones/i });

    await userEvent.type(input, 'STARBUCKS');
    const clearBtn = screen.getByRole('button', { name: /limpiar/i });
    await userEvent.click(clearBtn);

    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenLastCalledWith('');
  });

  it('hides clear button after clearing', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: /buscar transacciones/i });

    await userEvent.type(input, 'texto');
    await userEvent.click(screen.getByRole('button', { name: /limpiar/i }));

    expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();
    expect(input).toHaveValue('');
  });
});
