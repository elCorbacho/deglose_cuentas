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

  it('loads PDF B after PDF A → only PDF B transactions shown (no accumulation)', async () => {
    // Transactions for PDF A — $17.000 combined
    const pdfATransactions = [
      {
        fecha: '05/01/24',
        comercio: 'SUPERMERCADO UNO',
        monto: 12000,
        ciudad: 'SANTIAGO',
        raw: 'a1',
      },
      {
        fecha: '06/01/24',
        comercio: 'CAFETERIA CENTRO',
        monto: 5000,
        ciudad: 'SANTIAGO',
        raw: 'a2',
      },
    ];
    const pdfACategorized = [
      { ...pdfATransactions[0], categoria: 'Supermercado' },
      { ...pdfATransactions[1], categoria: 'Comidas' },
    ];

    // Transactions for PDF B — $8.000 combined (different merchants)
    const pdfBTransactions = [
      { fecha: '10/01/24', comercio: 'FARMACIA NORTE', monto: 6000, ciudad: 'SANTIAGO', raw: 'b1' },
      { fecha: '11/01/24', comercio: 'TIENDA SUR', monto: 2000, ciudad: 'SANTIAGO', raw: 'b2' },
    ];
    const pdfBCategorized = [
      { ...pdfBTransactions[0], categoria: 'Farmacia' },
      { ...pdfBTransactions[1], categoria: 'Tienda' },
    ];

    vi.mocked(parse).mockReset();
    vi.mocked(categorize).mockReset();
    vi.mocked(parse).mockImplementation((_text: string) => {
      // Try to find by text match (all calls have same text), fall back to calls.length
      const calls = vi.mocked(parse).mock.calls.length;
      return calls <= 1 ? pdfATransactions : pdfBTransactions;
    });
    vi.mocked(categorize).mockImplementation((txs: unknown) => {
      const arr = txs as typeof pdfATransactions;
      if (!arr || arr.length === 0) return [];
      if (arr[0].comercio === 'SUPERMERCADO UNO') return pdfACategorized;
      if (arr[0].comercio === 'CAFETERIA CENTRO') return pdfACategorized;
      if (arr[0].comercio === 'FARMACIA NORTE') return pdfBCategorized;
      if (arr[0].comercio === 'TIENDA SUR') return pdfBCategorized;
      return [];
    });
    vi.mocked(getCategories).mockResolvedValue({
      categories: [
        { name: 'Supermercado', icon: '🛒', keywords: ['SUPERMERCADO'] },
        { name: 'Comidas', icon: '🍽️', keywords: ['CAFETERIA'] },
        { name: 'Farmacia', icon: '💊', keywords: ['FARMACIA'] },
        { name: 'Tienda', icon: '🛍️', keywords: ['TIENDA'] },
      ],
    });

    const { container } = render(<App />);

    // Upload PDF A
    await uploadPdf(container);
    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });

    // Verify PDF A totals are shown ($17.000 = 12000 + 5000)
    expect(screen.getByText('$17.000')).toBeInTheDocument();

    // Click "Nuevo PDF" to reset and return to upload view
    await userEvent.click(screen.getByRole('button', { name: /nuevo pdf/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /entiende tus gastos sin complicarte/i })
      ).toBeInTheDocument();
    });

    // Now upload PDF B
    const pdfBFile = new File(['%PDF-1.4'], 'farmacia.pdf', { type: 'application/pdf' });
    const input = await waitFor(() => {
      const el =
        document.getElementById('pdf-upload-input') ?? document.querySelector('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    Object.defineProperty(input, 'files', { value: [pdfBFile], configurable: true });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });

    // REPLACEMENT: Only PDF B's $8.000 total should remain (NOT $25.000)
    expect(screen.getByText('$8.000')).toBeInTheDocument();

    // Expand categories to verify merchant names
    const farmaciaBtn = screen.getByRole('button', { name: /farmacia/i });
    await userEvent.click(farmaciaBtn);
    expect(screen.getByText(/FARMACIA NORTE/i)).toBeInTheDocument();

    const tiendaBtn = screen.getByRole('button', { name: /tienda/i });
    await userEvent.click(tiendaBtn);
    expect(screen.getByText(/TIENDA SUR/i)).toBeInTheDocument();

    // PDF A merchants must NOT appear
    expect(screen.queryByText(/SUPERMERCADO UNO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CAFETERIA CENTRO/i)).not.toBeInTheDocument();
  });

  it('multi-select in single upload action combines PDFs', async () => {
    // For multi-select: two files are processed in ONE handleFiles call.
    // Each file gets its own transaction set via call-count-based mockImplementation.
    const pdfATransactions = [
      {
        fecha: '05/01/24',
        comercio: 'SUPERMERCADO UNO',
        monto: 12000,
        ciudad: 'SANTIAGO',
        raw: 'a1',
      },
    ];
    const pdfBTransactions = [
      {
        fecha: '06/01/24',
        comercio: 'CAFETERIA CENTRO',
        monto: 5000,
        ciudad: 'SANTIAGO',
        raw: 'b1',
      },
    ];
    const pdfACategorized = [{ ...pdfATransactions[0], categoria: 'Supermercado' }];
    const pdfBCategorized = [{ ...pdfBTransactions[0], categoria: 'Comidas' }];

    // Use mutable arrays to track call counts — safer than mock.calls.length
    // because it doesn't depend on Vitest internals
    const parseOutputs: Array<typeof pdfATransactions> = [];
    const categorizeOutputs: Array<typeof pdfACategorized> = [];

    vi.mocked(parse).mockReset();
    vi.mocked(categorize).mockReset();
    vi.mocked(parse).mockImplementation(() => {
      const result = parseOutputs.shift() ?? pdfATransactions;
      return result;
    });
    vi.mocked(categorize).mockImplementation((_txs: unknown) => {
      const result = categorizeOutputs.shift() ?? [];
      return result;
    });
    vi.mocked(getCategories).mockResolvedValue({
      categories: [
        { name: 'Supermercado', icon: '🛒', keywords: ['SUPERMERCADO'] },
        { name: 'Comidas', icon: '🍽️', keywords: ['CAFETERIA'] },
      ],
    });

    const { container: _container } = render(<App />);

    // Enqueue parse and categorize results BEFORE uploading
    parseOutputs.push(pdfATransactions, pdfBTransactions);
    categorizeOutputs.push(pdfACategorized, pdfBCategorized);

    // Upload both PDFs in a single action
    const fileA = new File(['%PDF-1.4'], 'cartola-a.pdf', { type: 'application/pdf' });
    const fileB = new File(['%PDF-1.4'], 'cartola-b.pdf', { type: 'application/pdf' });
    const input = await waitFor(() => {
      const el =
        document.getElementById('pdf-upload-input') ?? document.querySelector('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    Object.defineProperty(input, 'files', { value: [fileA, fileB], configurable: true });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });

    // Multi-select COMBINES A+B → $17.000
    expect(screen.getByText('$17.000')).toBeInTheDocument();

    // Expand categories and verify both merchants appear
    await userEvent.click(screen.getByRole('button', { name: /supermercado/i }));
    expect(screen.getByText(/SUPERMERCADO UNO/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /comidas/i }));
    expect(screen.getByText(/CAFETERIA CENTRO/i)).toBeInTheDocument();
  });

  it('localStorage only contains data from the last loaded PDF', async () => {
    // Load PDF A
    const pdfATransactions = [
      {
        fecha: '05/01/24',
        comercio: 'SUPERMERCADO UNO',
        monto: 12000,
        ciudad: 'SANTIAGO',
        raw: 'a1',
      },
    ];
    const pdfACategorized = [{ ...pdfATransactions[0], categoria: 'Supermercado' }];

    vi.mocked(parse).mockReset();
    vi.mocked(categorize).mockReset();
    vi.mocked(parse).mockReturnValue(pdfATransactions);
    vi.mocked(categorize).mockReturnValue(pdfACategorized);
    vi.mocked(getCategories).mockResolvedValue({
      categories: [{ name: 'Supermercado', icon: '🛒', keywords: ['SUPERMERCADO'] }],
    });

    const { container } = render(<App />);
    await uploadPdf(container);
    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('$12.000').length).toBeGreaterThanOrEqual(1);

    // Verify localStorage has PDF A's data
    const stateA = JSON.parse(localStorage.getItem('pdfState') || '{}');
    expect(stateA.rawTransactions).toHaveLength(1);
    expect(stateA.rawTransactions[0].comercio).toBe('SUPERMERCADO UNO');

    // Click "Nuevo PDF" then load PDF B
    await userEvent.click(screen.getByRole('button', { name: /nuevo pdf/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /entiende tus gastos sin complicarte/i })
      ).toBeInTheDocument();
    });

    const pdfBTransactions = [
      { fecha: '10/01/24', comercio: 'FARMACIA NORTE', monto: 6000, ciudad: 'SANTIAGO', raw: 'b1' },
    ];
    const pdfBCategorized = [{ ...pdfBTransactions[0], categoria: 'Farmacia' }];

    vi.mocked(parse).mockReset();
    vi.mocked(categorize).mockReset();
    vi.mocked(parse).mockReturnValue(pdfBTransactions);
    vi.mocked(categorize).mockReturnValue(pdfBCategorized);
    vi.mocked(getCategories).mockResolvedValue({
      categories: [{ name: 'Farmacia', icon: '💊', keywords: ['FARMACIA'] }],
    });

    const inputB = await waitFor(() => {
      const el =
        document.getElementById('pdf-upload-input') ?? document.querySelector('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    Object.defineProperty(inputB, 'files', {
      value: [new File(['%PDF-1.4'], 'farmacia.pdf', { type: 'application/pdf' })],
      configurable: true,
    });
    fireEvent.change(inputB);

    await waitFor(() => {
      expect(screen.queryByText(/procesando tu pdf/i)).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('$6.000').length).toBeGreaterThanOrEqual(1);

    // CRITICAL: localStorage must have PDF B's data ONLY — PDF A must be gone
    const stateB = JSON.parse(localStorage.getItem('pdfState') || '{}');
    expect(stateB.rawTransactions).toHaveLength(1);
    expect(stateB.rawTransactions[0].comercio).toBe('FARMACIA NORTE');
    expect(stateB.fileName).toBe('farmacia.pdf');
  });
});
