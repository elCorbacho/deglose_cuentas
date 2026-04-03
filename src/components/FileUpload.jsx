import { useState } from 'react'

export default function FileUpload({ onFileLoaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (file) => {
    setError('')

    if (!file || file.type !== 'application/pdf') {
      setError('Archivo no válido. Subí un PDF de estado de cuenta para continuar.')
      return
    }

    onFileLoaded(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
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
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-[24px] border-2 border-dashed p-5 transition-all duration-200 sm:p-7 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-100'
            : 'border-slate-300 bg-white/90 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-3xl text-white shadow-lg shadow-slate-200">
              📄
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900 sm:text-xl">
                Arrastrá tu estado de cuenta Santander acá
              </p>
              <p className="text-sm leading-6 text-slate-600">
                También podés hacer clic para seleccionar el archivo manualmente.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="badge-soft">PDF solamente</span>
              <span className="badge-soft">Sin cambiar tus datos</span>
              <span className="badge-soft">Vista categorizada</span>
            </div>

            <div>
              <span className="btn-secondary">Seleccionar PDF</span>
            </div>
          </div>
        </label>
      </div>

      <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-muted px-4 py-3 leading-6">
          Consejo: usá el mismo PDF que descargás desde tu banco para mantener la lectura correcta.
        </div>

        <div className={`rounded-2xl border px-4 py-3 leading-6 ${
          error
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          {error || 'Si el archivo no es válido, te lo avisamos acá mismo antes de procesarlo.'}
        </div>
      </div>
    </div>
  )
}
