import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FileUpload from '../components/organisms/FileUpload';

function makePdf(name: string) {
  return new File(['%PDF-1.4'], name, { type: 'application/pdf' });
}

function makeNonPdf(name: string) {
  return new File(['texto plano'], name, { type: 'text/plain' });
}

describe('FileUpload', () => {
  it('shows inline guidance and blocks non-PDF files', async () => {
    const onFilesLoaded = vi.fn();
    const { container } = render(<FileUpload onFilesLoaded={onFilesLoaded} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = makeNonPdf('resumen.txt');

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(onFilesLoaded).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/archivo no válido/i)).toBeInTheDocument();
    expect(screen.getByText(/seleccionar pdf/i)).toBeInTheDocument();
  });

  it('accepts multiple PDF files and calls onFilesLoaded with them', async () => {
    const onFilesLoaded = vi.fn();
    const { container } = render(<FileUpload onFilesLoaded={onFilesLoaded} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = makePdf('estado1.pdf');
    const file2 = makePdf('estado2.pdf');

    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(onFilesLoaded).toHaveBeenCalledTimes(1);
    expect(onFilesLoaded).toHaveBeenCalledWith([file1, file2]);
  });

  it('rejects more than 10 files and shows limit error with role="alert"', async () => {
    const onFilesLoaded = vi.fn();
    const { container } = render(<FileUpload onFilesLoaded={onFilesLoaded} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const files = Array.from({ length: 11 }, (_, i) => makePdf(`estado${i + 1}.pdf`));

    fireEvent.change(input, { target: { files } });

    expect(onFilesLoaded).not.toHaveBeenCalled();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/10/);
  });

  it('shows per-file error with role="alert" for non-PDF files among valid ones', async () => {
    const onFilesLoaded = vi.fn();
    const { container } = render(<FileUpload onFilesLoaded={onFilesLoaded} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = makePdf('estado.pdf');
    const txtFile = makeNonPdf('notas.txt');

    fireEvent.change(input, { target: { files: [pdfFile, txtFile] } });

    // The non-PDF should cause an error visible via role="alert"
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/notas\.txt/i);
    // Valid PDF still triggers load
    expect(onFilesLoaded).toHaveBeenCalledWith([pdfFile]);
  });

  it('accepts a single PDF file (backward compatibility)', async () => {
    const onFilesLoaded = vi.fn();
    const { container } = render(<FileUpload onFilesLoaded={onFilesLoaded} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = makePdf('estado.pdf');
    fireEvent.change(input, { target: { files: [pdfFile] } });

    expect(onFilesLoaded).toHaveBeenCalledWith([pdfFile]);
  });
});
