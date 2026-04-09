import { useState } from 'react'
import { FileText, Info } from 'lucide-react'
import Button from '../atoms/Button.jsx'
import { Tooltip, TooltipTrigger, TooltipContent } from '../atoms/Tooltip.jsx'

export default function FileUpload({ onFileLoaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (file) => {
    setError('')

    if (!file || file.type !== 'application/pdf') {
      setError('Archivo no válido. Sube un PDF de estado de cuenta para continuar.')
      return
    }

    onFileLoaded(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer?.files?.[0]
    if (!droppedFile) return
    handleFile(droppedFile)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (event) => {
    handleFile(event.target.files[0])
  }

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
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col gap-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl upload-icon">
            <FileText className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <p className="text-base font-semibold sm:text-lg" style={{ color: 'var(--text-strong)' }}>
                Arrastra tu estado de cuenta Santander aquí
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4" style={{ color: 'var(--text-soft)', cursor: 'help' }} />
                </TooltipTrigger>
                <TooltipContent>Solo PDFs de estados de cuenta Santander</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm leading-5" style={{ color: 'var(--text-base)' }}>
              También puedes hacer clic para seleccionar el archivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="badge-soft cursor-help">PDF solamente</span>
              </TooltipTrigger>
              <TooltipContent>Solo archivos PDF son soportados</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="badge-soft cursor-help">Sin cambiar tus datos</span>
              </TooltipTrigger>
              <TooltipContent>Tu información no se guarda en servidores</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="badge-soft cursor-help">Vista categorizada</span>
              </TooltipTrigger>
              <TooltipContent>Los gastos se agrupan automáticamente</TooltipContent>
            </Tooltip>
          </div>

          <div>
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="pdf-upload-input" className="cursor-pointer">
                Seleccionar PDF
              </label>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-[1.2fr_0.8fr]">
        <div className="upload-tip px-3 py-2 leading-5">
          Consejo: usa el mismo PDF que descargas desde tu banco para mantener la lectura correcta.
        </div>

        <div className={`upload-feedback ${error ? 'upload-feedback-error' : ''} px-3 py-2 leading-5`}>
          {error || 'Si el archivo no es válido, te lo avisamos aquí mismo antes de procesarlo.'}
        </div>
      </div>
    </div>
  )
}
