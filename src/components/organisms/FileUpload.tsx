import { useState } from 'react';
import type { ChangeEvent, DragEvent, MouseEvent } from 'react';
import { FileText, Info } from 'lucide-react';
import Button from '../atoms/Button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../atoms/Tooltip';

const MAX_FILES = 10;

interface FileUploadProps {
  onFilesLoaded: (files: File[]) => void | Promise<void>;
}

export default function FileUpload({ onFilesLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (fileList: FileList | File[]) => {
    setError('');
    const files = Array.from(fileList);

    if (files.length === 0) return;

    // 10-file limit
    if (files.length > MAX_FILES) {
      setError(`Se permite un máximo de ${MAX_FILES} archivos a la vez.`);
      return;
    }

    // Validate each file: only PDFs allowed
    const validFiles: File[] = [];
    const invalidNames: string[] = [];

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        invalidNames.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidNames.length > 0) {
      setError(`Archivo no válido: ${invalidNames.join(', ')}. Solo se permiten archivos PDF.`);
    }

    if (validFiles.length > 0) {
      onFilesLoaded(validFiles);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer?.files;
    if (!dropped || dropped.length === 0) return;
    handleFiles(dropped);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    handleFiles(fileList);
  };

  const handleOpenPicker = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const input = document.getElementById('pdf-upload-input') as HTMLInputElement | null;
    input?.click();
  };

  return (
    <div className="space-y-3">
      <style>{`
        .upload-zone {
          border-width: 2px;
          border-style: dashed;
          border-radius: 18px;
          padding: 0.9rem;
          transition: all 200ms;
        }
        @media (min-width: 640px) {
          .upload-zone {
            padding: 1.1rem;
          }
        }
        .upload-zone-default {
          border-color: var(--border-soft);
          background: var(--bg-panel);
        }
        .upload-zone-default:hover {
          border-color: var(--border-strong);
          background: var(--bg-shell);
        }
        .upload-zone-dragging {
          border-color: var(--border-strong);
          background: var(--bg-accent-soft);
          box-shadow: var(--shadow-card);
        }
        .upload-icon {
          background: var(--text-accent);
          color: white;
          box-shadow: var(--shadow-card);
        }
        .upload-tip {
          border-radius: 12px;
          border: 1px solid var(--border-soft);
          background: var(--bg-shell);
          color: var(--text-soft);
        }
        .upload-feedback {
          border-radius: 12px;
          border: 1px solid var(--border-soft);
          background: var(--bg-shell);
          color: var(--text-soft);
        }
        .upload-feedback-error {
          border-color: var(--border-strong);
          background: var(--bg-danger-soft);
          color: var(--text-danger);
        }
      `}</style>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`upload-zone ${isDragging ? 'upload-zone-dragging' : 'upload-zone-default'}`}
      >
        <input
          id="pdf-upload-input"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col gap-3 text-center">
          <div className="upload-icon mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
            <FileText className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <p
                className="text-base font-semibold sm:text-lg"
                style={{ color: 'var(--text-strong)' }}
              >
                Arrastra tu estado de cuenta Santander aquí
              </p>
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex">
                    <Info
                      className="h-4 w-4"
                      style={{ color: 'var(--text-soft)', cursor: 'help' }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Hasta {MAX_FILES} PDFs de estados de cuenta Santander
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm leading-5" style={{ color: 'var(--text-base)' }}>
              Podés seleccionar hasta {MAX_FILES} archivos a la vez.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <span className="badge-soft cursor-help">PDF solamente</span>
              </TooltipTrigger>
              <TooltipContent>Solo archivos PDF son soportados</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <span className="badge-soft cursor-help">Sin cambiar tus datos</span>
              </TooltipTrigger>
              <TooltipContent>Tu información no se guarda en servidores</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <span className="badge-soft cursor-help">Vista categorizada</span>
              </TooltipTrigger>
              <TooltipContent>Los gastos se agrupan automáticamente</TooltipContent>
            </Tooltip>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={handleOpenPicker}>
              Seleccionar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-[1.2fr_0.8fr]">
        <div className="upload-tip px-3 py-2 leading-5">
          Consejo: usa el mismo PDF que descargas desde tu banco para mantener la lectura correcta.
        </div>

        <div
          role={error ? 'alert' : undefined}
          className={`upload-feedback ${error ? 'upload-feedback-error' : ''} px-3 py-2 leading-5`}
        >
          {error || 'Si el archivo no es válido, te lo avisamos aquí mismo antes de procesarlo.'}
        </div>
      </div>
    </div>
  );
}
