import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ExportButton from '../components/atoms/ExportButton';
import { TooltipProvider } from '../components/ui/tooltip';

function renderWithTooltip(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('ExportButton', () => {
  it('renders an enabled button when disabled prop is false', () => {
    renderWithTooltip(<ExportButton onClick={vi.fn()} disabled={false} />);
    const btn = screen.getByRole('button', { name: /exportar/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('renders a disabled button when disabled prop is true', () => {
    renderWithTooltip(<ExportButton onClick={vi.fn()} disabled={true} />);
    // When disabled, the Tooltip wraps the button; use the one that has the aria-label attribute
    const btns = screen.getAllByRole('button', { name: /exportar/i });
    const actualBtn = btns.find((b) => b.hasAttribute('aria-label'));
    expect(actualBtn).toBeDefined();
    expect(actualBtn).toBeDisabled();
  });

  it('calls onClick handler when clicked in enabled state', async () => {
    const onClick = vi.fn();
    renderWithTooltip(<ExportButton onClick={onClick} disabled={false} />);
    const btn = screen.getByRole('button', { name: /exportar/i });

    await userEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when button is disabled', async () => {
    const onClick = vi.fn();
    renderWithTooltip(<ExportButton onClick={onClick} disabled={true} />);
    const btns = screen.getAllByRole('button', { name: /exportar/i });
    const actualBtn = btns.find((b) => b.hasAttribute('aria-label')) as HTMLButtonElement;

    await userEvent.click(actualBtn);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('has an aria-label attribute', () => {
    renderWithTooltip(<ExportButton onClick={vi.fn()} disabled={false} />);
    const btn = screen.getByRole('button', { name: /exportar/i });
    expect(btn).toHaveAttribute('aria-label');
  });

  it('is reachable by keyboard (has tabIndex >= 0)', () => {
    renderWithTooltip(<ExportButton onClick={vi.fn()} disabled={false} />);
    const btn = screen.getByRole('button', { name: /exportar/i });
    // Default button tabIndex is 0; disabled buttons may have -1 but enabled should be reachable
    expect(Number(btn.getAttribute('tabindex') ?? '0')).toBeGreaterThanOrEqual(0);
  });
});
