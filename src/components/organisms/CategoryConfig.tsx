/**
 * CategoryConfig Organism
 * Manages category configuration with animated list, editor panel, and preview
 */

import React, { useState, useEffect, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Trash2, Download, Upload, Search, Tag, CheckCircle2 } from 'lucide-react'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import { getCategories, saveCategories, exportCategories } from '../../services/api'
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../data/categories'
import type { CategoriesPayload, CategoryJson } from '../../types'

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp: any = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
}

const containerVariants: any = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
    },
  },
}

const listItemVariants: any = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
}

const panelVariants: any = {
  hidden: { opacity: 0, scale: 0.98, y: 6 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:   { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.18, ease: 'easeIn'  } },
}

const tagVariants: any = {
  hidden: { opacity: 0, scale: 0.75 },
  show:   { opacity: 1, scale: 1,    transition: { type: 'spring', stiffness: 380, damping: 22 } },
  exit:   { opacity: 0, scale: 0.7,  transition: { duration: 0.12 } },
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface KeywordTagProps {
  keyword: string
  onRemove: () => void
}

interface CategoryRowProps {
  category: CategoryJson
  isSelected: boolean
  onClick: () => void
}

interface CategoryConfigProps {
  onSaved?: () => void
}

const KeywordTag = ({ keyword, onRemove }: KeywordTagProps) => (
  <motion.span
    layout
    variants={tagVariants}
    initial="hidden"
    animate="show"
    exit="exit"
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
    style={{ background: 'var(--bg-accent-soft)', color: 'var(--text-base)', border: '1px solid var(--border-strong)' }}
  >
    <Tag className="w-3 h-3 shrink-0" style={{ color: 'var(--text-accent)' }} />
    {keyword}
    <button
      onClick={onRemove}
      className="ml-0.5 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold leading-none transition-colors hover:bg-red-100"
      style={{ color: 'var(--text-danger)' }}
      aria-label={`Eliminar ${keyword}`}
    >
      ×
    </button>
  </motion.span>
)

const CategoryRow = ({ category, isSelected, onClick }: CategoryRowProps) => (
  <motion.li
    variants={listItemVariants}
    layout
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors duration-150 ${!isSelected ? 'hover:bg-[var(--bg-accent-soft)]' : ''}`}
    style={{
      borderBottom: '1px solid var(--border-soft)',
      background: isSelected ? 'var(--bg-accent-soft)' : undefined,
      borderLeft: isSelected ? '2px solid var(--text-accent)' : '2px solid transparent',
    }}
  >
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-base shrink-0">{category.icon}</span>
      <span
        className="text-sm font-medium truncate"
        style={{ color: isSelected ? 'var(--text-accent)' : 'var(--text-base)' }}
      >
        {category.name}
      </span>
    </div>
    <span
      className="badge-soft badge-soft--compact shrink-0"
      style={isSelected ? { background: 'var(--bg-accent-soft)', color: 'var(--text-accent)' } : undefined}
    >
      {category.keywords.length}
    </span>
  </motion.li>
)

// ── Main component ────────────────────────────────────────────────────────────

const CategoryConfig = ({ onSaved }: CategoryConfigProps) => {
  const [categories, setCategories] = useState<CategoryJson[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryJson | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [searchTerm, setSearchTerm]           = useState('')
  const [previewText, setPreviewText]         = useState('')
  const [previewResult, setPreviewResult] = useState<{ name: string; icon: string } | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newKeyword, setNewKeyword]           = useState('')
  const [saving, setSaving]                   = useState(false)

  useEffect(() => {
    setCategories(
      Object.entries(DEFAULT_CATEGORIES).map(([name, config]) => ({
        name,
        icon: config.icon,
        keywords: config.keywords,
      }))
    )

    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data.categories)
      } catch (err) {
        console.error('Error loading categories:', err)
        toast.error('No se pudo cargar desde backend; usando categorías locales')
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories
    const term = searchTerm.toLowerCase()
    return categories.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.keywords.some(k => k.toLowerCase().includes(term))
    )
  }, [categories, searchTerm])

  const duplicateWarnings = useMemo(() => {
    const warnings: string[] = []
    const keywordMap: Record<string, string> = {}
    categories.forEach(cat => {
      cat.keywords.forEach(kw => {
        const upper = kw.toUpperCase()
        if (keywordMap[upper]) {
          warnings.push(`"${kw}" está en "${keywordMap[upper]}" y "${cat.name}"`)
        } else {
          keywordMap[upper] = cat.name
        }
      })
    })
    return warnings
  }, [categories])

  const updateCategory = (updatedCat: CategoryJson) => {
    setSelectedCategory(updatedCat)
    setCategories(prev => prev.map(c => (c.name === selectedCategory?.name ? updatedCat : c)))
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePreview = () => {
    if (!previewText.trim()) { setPreviewResult(null); return }
    const upperText = previewText.toUpperCase()
    let matched = null
    for (const cat of categories) {
      for (const kw of cat.keywords) {
        if (upperText.includes(kw.toUpperCase())) { matched = cat; break }
      }
      if (matched) break
    }
    setPreviewResult(matched || { name: 'Otros', icon: '📋' })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCategories({ version: '1.0', categories })
      toast.success('Categorías guardadas correctamente')
      if (onSaved) onSaved()
    } catch (err) {
      console.error('Error saving:', err)
      toast.error('Error al guardar: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportCategories()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'categories.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('JSON exportado')
    } catch (err) {
      toast.error('Error al exportar: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    }
  }

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result !== 'string') {
          toast.error('Formato de archivo inválido')
          return
        }
        const json = JSON.parse(result) as CategoriesPayload
        if (json.categories && Array.isArray(json.categories)) {
          setCategories(json.categories)
          toast.success('JSON importado — Guarda para aplicar cambios')
        } else {
          toast.error('Formato de JSON inválido')
        }
      } catch (err) {
        toast.error('Error parseando JSON: ' + (err instanceof Error ? err.message : 'Error desconocido'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    const trimmedName = newCategoryName.trim()
    if (categories.some(c => c.name.toUpperCase() === trimmedName.toUpperCase())) {
      toast.error('Ya existe una categoría con ese nombre')
      return
    }
    const newCat = { name: trimmedName, icon: '📋', keywords: [] }
    setCategories(prev => [...prev, newCat])
    setNewCategoryName('')
    setSelectedCategory(newCat)
  }

  const handleDeleteCategory = () => {
    if (!selectedCategory) return
    if (!confirm(`¿Eliminar categoría "${selectedCategory.name}"?`)) return
    setCategories(prev => prev.filter(c => c.name !== selectedCategory.name))
    setSelectedCategory(null)
  }

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !selectedCategory) return
    if (selectedCategory.keywords.some(k => k.toUpperCase() === newKeyword.trim().toUpperCase())) {
      toast.error('Esta palabra ya existe')
      return
    }
    const updatedCat = { ...selectedCategory, keywords: [...selectedCategory.keywords, newKeyword.trim()] }
    updateCategory(updatedCat)
    setNewKeyword('')
  }

  const handleCategoryNameChange = (newName: string) => {
    if (!newName.trim() || !selectedCategory) return
    if (
      categories.some(
        c => c.name.toUpperCase() === newName.trim().toUpperCase() && c.name !== selectedCategory.name
      )
    ) {
      toast.error('Ya existe una categoría con ese nombre')
      return
    }
    updateCategory({ ...selectedCategory, name: newName.trim() })
  }

  const handleRemoveKeyword = (idx: number) => {
    if (!selectedCategory) return
    const updatedCat = {
      ...selectedCategory,
      keywords: selectedCategory.keywords.filter((_, i) => i !== idx),
    }
    updateCategory(updatedCat)
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 text-center"
        style={{ color: 'var(--text-soft)' }}
      >
        <div className="inline-block h-7 w-7 animate-spin rounded-full mb-3 spinner-ring" />
        <p className="text-sm">Cargando categorías…</p>
      </motion.div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="flex flex-col"
      style={{ minHeight: '500px' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: 'var(--text-soft)' }}>
            Configuración
          </p>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-strong)' }}>
            Categorías
          </h2>
        </div>

        {/* Duplicate warnings badge */}
        <AnimatePresence>
          {duplicateWarnings.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="exit"
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'var(--bg-danger-soft)', color: 'var(--text-danger)', border: '1px solid rgba(251,86,91,0.2)' }}
            >
              ⚠️ {duplicateWarnings.length} keyword{duplicateWarnings.length > 1 ? 's' : ''} duplicada{duplicateWarnings.length > 1 ? 's' : ''}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Search ── */}
      <motion.div className="mb-4 relative" initial="hidden" animate="show" variants={fadeUp}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-soft)' }}
        />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar categorías o palabras clave…"
          className="pl-9"
        />
      </motion.div>

      {/* ── Main split ── */}
      <div className="flex flex-1 min-h-0 gap-4">

        {/* ── Left: category list ── */}
        <motion.div className="w-1/3 flex flex-col" initial="hidden" animate="show" variants={fadeUp}>
          {/* Add new category */}
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nueva categoría"
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button
              onClick={handleAddCategory}
              size="sm"
              title="Agregar categoría"
              className="shrink-0 px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* List */}
          <div
            className="flex-1 overflow-y-auto rounded-lg border"
            style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}
          >
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((category) => (
                  <React.Fragment key={category.name}>
                    <CategoryRow
                      category={category}
                      isSelected={selectedCategory?.name === category.name}
                      onClick={() => setSelectedCategory(category)}
                    />
                  </React.Fragment>
                ))}
              </AnimatePresence>

              {filteredCategories.length === 0 && (
                <motion.li
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="p-6 text-center text-sm"
                  style={{ color: 'var(--text-soft)' }}
                >
                  {searchTerm ? 'Sin resultados' : 'No hay categorías'}
                </motion.li>
              )}
            </motion.ul>
          </div>
        </motion.div>

        {/* ── Right: editor panel ── */}
        <div className="w-2/3 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedCategory ? (
              <motion.div
                key={selectedCategory.name + '-editor'}
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-col flex-1 rounded-lg border p-4"
                style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}
              >
                {/* Editor header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedCategory.icon}</span>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>
                      {selectedCategory.name}
                    </h3>
                  </div>
                  <Button
                    onClick={handleDeleteCategory}
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </Button>
                </div>

                {/* Name field */}
                <div className="mb-4">
                  <label className="block mb-1.5 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-soft)' }}>
                    Nombre
                  </label>
                  <Input
                    type="text"
                    value={selectedCategory.name}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                  />
                </div>

                {/* Icon field */}
                <div className="mb-4">
                  <label className="block mb-1.5 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-soft)' }}>
                    Icono
                  </label>
                  <Input
                    type="text"
                    value={selectedCategory.icon}
                    onChange={(e) => updateCategory({ ...selectedCategory, icon: e.target.value })}
                    className="w-20 text-center text-lg"
                  />
                </div>

                {/* Keywords */}
                <div className="flex-1">
                  <label className="block mb-2 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-soft)' }}>
                    Palabras clave
                    <span className="ml-2 badge-soft badge-soft--compact normal-case tracking-normal font-medium">
                      {selectedCategory.keywords.length}
                    </span>
                  </label>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3 min-h-[2rem]">
                    <AnimatePresence mode="popLayout">
                      {selectedCategory.keywords.map((kw, idx) => (
                        <React.Fragment key={kw + idx}>
                          <KeywordTag
                            keyword={kw}
                            onRemove={() => handleRemoveKeyword(idx)}
                          />
                        </React.Fragment>
                      ))}
                    </AnimatePresence>
                    {selectedCategory.keywords.length === 0 && (
                      <span className="text-xs italic" style={{ color: 'var(--text-soft)' }}>
                        Sin palabras clave — las transacciones irán a "Otros"
                      </span>
                    )}
                  </div>

                  {/* Add keyword */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Nueva palabra clave"
                      className="flex-1 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <Button onClick={handleAddKeyword} size="sm" variant="outline">
                      Agregar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-editor"
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex-1 flex flex-col items-center justify-center rounded-lg border gap-3 p-6"
                style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)', borderStyle: 'dashed' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--bg-shell)' }}
                >
                  <Tag className="w-5 h-5" style={{ color: 'var(--text-soft)' }} />
                </div>
                <p className="text-sm text-center" style={{ color: 'var(--text-soft)' }}>
                  Seleccioná una categoría para editar
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Preview ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-4 p-4 rounded-lg border"
        style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--text-soft)' }}>
          Probar categorización
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Escribí un comercio para probar…"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
          />
          <Button onClick={handlePreview} size="sm">
            Probar
          </Button>
        </div>

        <AnimatePresence>
          {previewResult && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="exit"
              className="mt-2.5 flex items-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--text-accent)' }} />
              <span style={{ color: 'var(--text-soft)' }}>Resultado:</span>
              <span className="font-semibold" style={{ color: 'var(--text-strong)' }}>
                {previewResult.icon} {previewResult.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Duplicate warnings (expanded) ── */}
      <AnimatePresence>
        {duplicateWarnings.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mt-3 p-3 rounded-lg"
            style={{ background: 'var(--bg-danger-soft)', border: '1px solid rgba(251,86,91,0.18)' }}
          >
            <p className="text-xs font-semibold mb-1.5 uppercase tracking-[0.1em]" style={{ color: 'var(--text-danger)' }}>
              ⚠️ Keywords duplicadas
            </p>
            <ul className="text-xs space-y-0.5 list-disc list-inside" style={{ color: 'var(--text-danger)' }}>
              {duplicateWarnings.map((w, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {w}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action buttons ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-4 pt-4 flex flex-wrap gap-2.5 border-t"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Guardando…
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>

        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-3.5 h-3.5" />
          Exportar JSON
        </Button>

        <label
          className="inline-flex items-center gap-2 h-7 px-2.5 text-[0.8rem] font-medium rounded-[min(var(--radius-md),12px)] border cursor-pointer transition-all select-none"
          style={{
            borderColor: 'var(--border-soft)',
            background: 'var(--bg-panel-strong)',
            color: 'var(--text-base)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-shell)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-panel-strong)' }}
        >
          <Upload className="w-3.5 h-3.5" />
          Importar JSON
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </motion.div>
    </motion.div>
  )
}

export default CategoryConfig
