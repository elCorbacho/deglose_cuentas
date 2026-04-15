import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { extractText } from '../lib/pdfParser';
import { parse } from '../lib/transactionExtractor';
import { categorize } from '../lib/categorizer';
import { getCategories } from '../services/api';

// Clear localStorage before each test so loadPdfState() returns null
// and App always starts in the upload view
beforeEach(() => {
  localStorage.clear();
});

vi.mock('../lib/pdfParser', () => ({
  extractText: vi.fn(),
}));

vi.mock('../lib/transactionExtractor', () => ({
  parse: vi.fn(),
}));

vi.mock('../lib/categorizer', () => ({
  categorize: vi.fn(),
}));

vi.mock('../services/api', () => ({
  getCategories: vi.fn(),
  saveCategories: vi.fn(),
  exportCategories: vi.fn(),
  getBackup: vi.fn(),
}));

const parsedTransactions = [
  {
    fecha: '05/01/24',
    comercio: 'SUPERMERCADO UNO',
    monto: 12000,
    ciudad: 'SANTIAGO',
    raw: 'parsed-1',
  },
  {
    fecha: '06/01/24',
    comercio: 'CAFETERIA CENTRO',
    monto: 5000,
    ciudad: 'SANTIAGO',
    raw: 'parsed-2',
  },
];

const categorizedTransactions = [
  { ...parsedTransactions[0], categoria: 'Supermercado' },
  { ...parsedTransactions[1], categoria: 'Comidas' },
];

function createPdfFile() {
  return new File(['%PDF-1.4'], 'cartola.pdf', { type: 'application/pdf' });
}

async function uploadPdf(_container: unknown, file = createPdfFile()) {
  // Wait for the file input to appear (categories load async on mount)
  const input = await waitFor(() => {
    const el =
      document.getElementById('pdf-upload-input') ?? document.querySelector('input[type="file"]');
    if (!el) throw new Error('File input not found');
    return el;
  });
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
}

function createDeferred() {
  let resolve!: (value: string) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(extractText).mockResolvedValue('pdf text');
    vi.mocked(parse).mockReturnValue(parsedTransactions);
    vi.mocked(categorize).mockReturnValue(categorizedTransactions);
    vi.mocked(getCategories).mockResolvedValue({
      categories: [
        { name: 'Supermercado', icon: '🛒', keywords: ['SUPERMERCADO'] },
        { name: 'Comidas', icon: '🍽️', keywords: ['CAFETERIA'] },
      ],
    });
  });

  it('renders sidebar with upload active by default', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /análisis/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /config/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inicio/i })).toHaveClass('active');
  });

  it('keeps upload view when clicking análisis without transactions', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /análisis/i }));

    expect(
      screen.getByRole('heading', { name: /entiende tus gastos sin complicarte/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inicio/i })).toHaveClass('active');
  });

  it('lets navigate to config view and back to upload', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /config/i }));
    expect(await screen.findByText(/categorías/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /inicio/i }));
    expect(
      screen.getByRole('heading', { name: /entiende tus gastos sin complicarte/i })
    ).toBeInTheDocument();
  });

  it('renders the upload view before any upload', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /entiende tus gastos sin complicarte/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/subí tu estado de cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/seleccionar pdf/i)).toBeInTheDocument();
  });

  it('shows an exclusive loading state while the PDF is being processed', async () => {
    const deferred = createDeferred();
    vi.mocked(extractText).mockReturnValue(deferred.promise);

    const { container } = render(<App />);
    await uploadPdf(container);

    expect(screen.getByText(/procesando tu pdf/i)).toBeInTheDocument();

    deferred.resolve('pdf text');
    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });
  });

  it('shows a recoverable error state and allows re-upload after empty extraction', async () => {
    vi.mocked(parse).mockReturnValue([]);

    const { container } = render(<App />);
    await uploadPdf(container);

    expect(
      await screen.findByText(/no se encontraron transacciones en el pdf/i)
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /intentar con otro pdf/i }));

    expect(
      screen.getByRole('heading', { name: /entiende tus gastos sin complicarte/i })
    ).toBeInTheDocument();
  });

  it('renders the results overview after a successful upload', async () => {
    const { container } = render(<App />);
    await uploadPdf(container);

    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('$17.000')).toBeInTheDocument();
  });

  it('shows analysis view with date filters after a successful upload', async () => {
    const { container } = render(<App />);
    await uploadPdf(container);

    // Wait for processing to complete and analysis view to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /análisis/i })).not.toBeDisabled();
    });

    await userEvent.click(screen.getByRole('button', { name: /análisis/i }));

    // The date filter should be visible in the analysis view
    await waitFor(() => {
      expect(screen.getByLabelText('Desde')).toBeInTheDocument();
      expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
    });
  });

  it('CRITICAL 2: search in Dashboard updates grandTotal metric to reflect filtered transactions', async () => {
    const { container } = render(<App />);
    await uploadPdf(container);

    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });

    // Navigate to dashboard view (the "Dashboard" sidebar button)
    await userEvent.click(screen.getByRole('button', { name: /^dashboard$/i }));

    // Dashboard shows full total initially in "Total Gastado" card
    await waitFor(() => {
      // The dashboard-total-value should show combined total
      expect(screen.getByRole('article', { name: /total gastado/i })).toBeInTheDocument();
    });

    // Confirm initial grandTotal is $17.000 (2 transactions combined)
    const totalCard = screen.getByRole('article', { name: /total gastado/i });
    expect(totalCard).toHaveTextContent('$17.000');

    // Type in the search bar to filter to only Supermercado transaction ($12.000)
    const searchInput = screen.getByRole('textbox', { name: /buscar transacciones/i });
    await userEvent.type(searchInput, 'SUPERMERCADO');

    // After search the "Total Gastado" card should reflect only the filtered transaction ($12.000)
    await waitFor(() => {
      expect(totalCard).toHaveTextContent('$12.000');
    });
  });

  it('lets users expand and collapse category details for readability', async () => {
    const { container } = render(<App />);
    await uploadPdf(container);

    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });

    // Navigate to analysis view after upload resolves
    await userEvent.click(screen.getByRole('button', { name: /análisis/i }));

    await userEvent.click(screen.getByRole('button', { name: /supermercado/i }));

    expect(screen.getByText(/supermercado uno/i)).toBeInTheDocument();
    expect(screen.getByText(/05\/01\/24/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /supermercado/i }));

    await waitFor(() => {
      expect(screen.queryByText(/supermercado uno/i)).not.toBeInTheDocument();
    });
  });
});
