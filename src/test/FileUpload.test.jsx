import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FileUpload from '../components/FileUpload.jsx'

describe('FileUpload', () => {
  it('shows inline guidance and blocks non-PDF files', async () => {
    const onFileLoaded = vi.fn()
    const { container } = render(<FileUpload onFileLoaded={onFileLoaded} />)
    const input = container.querySelector('input[type="file"]')
    const invalidFile = new File(['texto plano'], 'resumen.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [invalidFile] } })

    expect(onFileLoaded).not.toHaveBeenCalled()
    expect(screen.getByText(/archivo no válido/i)).toBeInTheDocument()
    expect(screen.getByText(/seleccionar pdf/i)).toBeInTheDocument()
  })
})
