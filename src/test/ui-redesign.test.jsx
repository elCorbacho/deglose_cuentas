import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '../index.css'
import Input from '../components/atoms/Input.jsx'
import Button from '../components/atoms/Button.jsx'
import Header from '../components/organisms/Header.jsx'
import Sidebar from '../components/organisms/Sidebar.jsx'
import CategoryList from '../components/organisms/CategoryList.jsx'

const cssPath = path.join(process.cwd(), 'src', 'index.css')
const css = readFileSync(cssPath, 'utf-8')

describe('UI redesign design-system behaviors', () => {
  it('defines redesign tokens in global css', () => {
    expect(css).toMatch(/--surface:\s*#fcf9f8;/i)
    expect(css).toMatch(/--surface-container-low:\s*#f6f3f2;/i)
    expect(css).toMatch(/--surface-container-lowest:\s*#ffffff;/i)
    expect(css).toMatch(/--outline-variant:\s*#c3c6d6;/i)
    expect(css).toMatch(/--primary-dark:\s*#003d9b;/i)
    expect(css).toMatch(/--primary:\s*#0052cc;/i)
  })

  it('renders header shell and defines glassmorphism css contract', () => {
    render(<Header total={12000} />)

    const header = screen.getByRole('banner')
    const total = screen.getByText('$12.000')

    expect(header).toBeInTheDocument()
    expect(total).toHaveClass('mono-num')
    expect(css).toMatch(/\.header-shell\s*\{[\s\S]*backdrop-filter:\s*blur\(24px\);/i)
    expect(css).toMatch(/\.header-shell\s*\{[\s\S]*background:\s*color-mix\(in srgb,\s*var\(--surface\)\s*80%,\s*transparent\);/i)
  })

  it('renders input base and defines ghost border rule', () => {
    render(<Input value="" onChange={() => {}} placeholder="Desde" />)

    const input = screen.getByPlaceholderText('Desde')

    expect(input).toHaveClass('input-base')
    expect(css).toMatch(/\.input-base\s*\{[\s\S]*border:\s*0;/i)
    expect(css).toMatch(/\.input-base\s*\{[\s\S]*outline:\s*1px\s+solid\s+color-mix\(in srgb,\s*var\(--outline-variant\)\s*15%,\s*transparent\);/i)
  })

  it('renders primary button and defines gradient + inner-glow contract', () => {
    render(<Button variant="primary">Analizar</Button>)

    const button = screen.getByRole('button', { name: 'Analizar' })

    expect(button).toHaveClass('btn-primary')
    expect(css).toMatch(/\.btn-primary\s*\{[\s\S]*background:\s*linear-gradient\(135deg,\s*var\(--primary-dark\),\s*var\(--primary\)\);/i)
    expect(css).toMatch(/\.btn-primary\s*\{[\s\S]*border-radius:\s*6px;/i)
    expect(css).toMatch(/\.btn-primary\s*\{[\s\S]*box-shadow:\s*inset\s+0\s+1px\s+0\s+rgba\(255,\s*255,\s*255,\s*0\.45\)/i)
  })

  it('renders sidebar selection wrapper and no-line contracts', () => {
    render(
      <Sidebar
        activeView="upload"
        hasTransactions
        onNavigate={() => {}}
      />,
    )

    const activeButton = screen.getByRole('button', { name: /cargar pdf/i })
    const selectionWrapper = activeButton.closest('.selection-item')

    expect(selectionWrapper).toHaveClass('is-active')
    expect(css).toMatch(/\.sidebar\s*\{[\s\S]*border-right:\s*0;/i)
    expect(css).toMatch(/\.sidebar-btn\.active\s*\{[\s\S]*background:\s*transparent;/i)
    expect(css).toMatch(/\.selection-item::before\s*\{[\s\S]*width:\s*2px;/i)
    expect(css).toMatch(/\.selection-item::before\s*\{[\s\S]*background:\s*var\(--primary\);/i)
  })

  it('uses surface-container-low class in category empty state', () => {
    render(<CategoryList categories={[]} />)

    const section = screen.getByText(/no encontramos resultados para ese filtro/i).closest('section')

    expect(section).toHaveClass('surface-container-low')
    expect(css).toMatch(/\.surface-container-low\s*\{[\s\S]*background:\s*var\(--surface-container-low\);/i)
  })
})
