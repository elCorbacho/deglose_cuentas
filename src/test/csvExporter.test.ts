import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportToCsv } from '../lib/csvExporter';
import type { PersistedTransaction } from '../types';

describe('exportToCsv', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let createObjectURLSpy: ReturnType<typeof vi.fn<(obj: any) => string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let revokeObjectURLSpy: ReturnType<typeof vi.fn<(url: any) => void>>;
  let appendChildSpy: ReturnType<typeof vi.fn<(node: Node) => void>>;
  let removeChildSpy: ReturnType<typeof vi.fn<(node: Node) => void>>;
  let clickSpy: ReturnType<typeof vi.fn<() => void>>;
  let createdBlobs: Blob[] = [];
  let createdLinks: HTMLAnchorElement[] = [];

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createObjectURLSpy = vi.fn<(obj: any) => string>().mockReturnValue('blob:mock-url');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    revokeObjectURLSpy = vi.fn<(url: any) => void>();
    clickSpy = vi.fn<() => void>();
    appendChildSpy = vi.fn<(node: Node) => void>();
    removeChildSpy = vi.fn<(node: Node) => void>();

    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });

    createdBlobs = [];
    createdLinks = [];

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const link = originalCreateElement('a') as HTMLAnchorElement;
        link.click = () => clickSpy();
        createdLinks.push(link);
        return link;
      }
      return originalCreateElement(tag);
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      appendChildSpy(node);
      return node as Node;
    });
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
      removeChildSpy(node);
      return node as Node;
    });

    // Capture Blobs created
    const OriginalBlob = globalThis.Blob;
    vi.stubGlobal(
      'Blob',
      class MockBlob extends OriginalBlob {
        constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
          super(parts, options);
          createdBlobs.push(this);
        }
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const baseTx: PersistedTransaction = {
    fecha: '01/01/24',
    comercio: 'JUMBO',
    monto: 15000,
    categoria: 'Supermercado',
  };

  it('triggers browser download when called with transactions', () => {
    exportToCsv([baseTx]);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });

  it('creates a Blob with CSV content-type', () => {
    exportToCsv([baseTx]);
    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe('text/csv;charset=utf-8;');
  });

  it('CSV content starts with UTF-8 BOM for Excel compatibility', async () => {
    exportToCsv([baseTx]);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    // Read as ArrayBuffer to check the raw UTF-8 BOM bytes: 0xEF 0xBB 0xBF
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    expect(bytes[0]).toBe(0xef);
    expect(bytes[1]).toBe(0xbb);
    expect(bytes[2]).toBe(0xbf);
  });

  it('CSV has correct column headers: fecha, comercio, monto, categoria', async () => {
    exportToCsv([baseTx]);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    const lines = text.replace('\uFEFF', '').split('\n');
    expect(lines[0]).toBe('fecha,comercio,monto,categoria');
  });

  it('escapes fields containing commas by wrapping in double quotes', async () => {
    const txWithComma: PersistedTransaction = {
      fecha: '01/01/24',
      comercio: 'TIENDA, LOCAL',
      monto: 5000,
      categoria: 'Compras',
    };
    exportToCsv([txWithComma]);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toContain('"TIENDA, LOCAL"');
  });

  it('escapes fields containing double quotes by doubling them', async () => {
    const txWithQuote: PersistedTransaction = {
      fecha: '01/01/24',
      comercio: 'TIENDA "CENTRAL"',
      monto: 5000,
      categoria: 'Compras',
    };
    exportToCsv([txWithQuote]);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toContain('"TIENDA ""CENTRAL"""');
  });

  it('escapes fields containing newlines by wrapping in double quotes', async () => {
    const txWithNewline: PersistedTransaction = {
      fecha: '01/01/24',
      comercio: 'TIENDA\nLINEA',
      monto: 5000,
      categoria: 'Compras',
    };
    exportToCsv([txWithNewline]);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toContain('"TIENDA\nLINEA"');
  });

  it('exports empty fields as empty string (not undefined or null)', async () => {
    const txNoComercio: PersistedTransaction = {
      fecha: '01/01/24',
      monto: 5000,
      categoria: 'Otros',
      // comercio is undefined
    };
    exportToCsv([txNoComercio]);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    const dataLine = text.replace('\uFEFF', '').split('\n')[1];
    // comercio field should be empty, not 'undefined' or 'null'
    expect(dataLine).not.toContain('undefined');
    expect(dataLine).not.toContain('null');
    // The line should have 4 comma-separated fields
    expect(dataLine.split(',').length).toBe(4);
  });

  it('exports multiple transactions as multiple data rows', async () => {
    const txs: PersistedTransaction[] = [
      { fecha: '01/01/24', comercio: 'JUMBO', monto: 10000, categoria: 'Supermercado' },
      { fecha: '02/01/24', comercio: 'COPEC', monto: 5000, categoria: 'Combustible' },
      { fecha: '03/01/24', comercio: 'STARBUCKS', monto: 3000, categoria: 'Cafeterías' },
    ];
    exportToCsv(txs);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    const lines = text
      .replace('\uFEFF', '')
      .split('\n')
      .filter((l) => l.trim() !== '');
    // 1 header + 3 data rows
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain('JUMBO');
    expect(lines[2]).toContain('COPEC');
    expect(lines[3]).toContain('STARBUCKS');
  });
});
