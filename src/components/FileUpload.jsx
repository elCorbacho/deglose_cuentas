import { useState } from 'react'

export default function FileUpload({ onFileLoaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (file) => {
    setError('')
    if (!file || file.type !== 'application/pdf') {
      setError('Archivo no válido. Por favor sube un PDF.')
      return
    }
    onFileLoaded(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full max-w-lg p-12 border-2 border-dashed rounded-xl text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <label className="cursor-pointer block">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-lg font-medium text-gray-700">
            Arrastra tu estado de cuenta Santander aquí
          </p>
          <p className="text-sm text-gray-400 mt-1">
            o haz clic para seleccionar un archivo PDF
          </p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
        </label>
      </div>
      {error && (
        <p className="text-red-600 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}
