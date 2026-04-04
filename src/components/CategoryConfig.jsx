import React, { useState, useEffect, useMemo } from 'react';
import { getCategories, saveCategories, exportCategories, getBackup } from '../services/api';

const CategoryConfig = ({ onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewResult, setPreviewResult] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories);
      } catch (err) {
        console.error('Error loading categories:', err);
        showMessage('Error cargando categorías', 'error');
      } finally {
        setLoading(false)
      }
    };
    loadCategories();
  }, []);

  const showMessage = (message, type = 'success') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Filtrar categorías por búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.keywords.some(k => k.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  // Preview de categorización
  const handlePreview = () => {
    if (!previewText.trim()) {
      setPreviewResult(null);
      return;
    }
    const upperText = previewText.toUpperCase();
    let matched = null;
    for (const cat of categories) {
      for (const kw of cat.keywords) {
        if (upperText.includes(kw.toUpperCase())) {
          matched = cat;
          break;
        }
      }
      if (matched) break;
    }
    setPreviewResult(matched || { name: 'Otros', icon: '📋' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCategories({ version: '1.0', categories });
      showMessage('Categorías guardadas correctamente');
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Error saving:', err);
      showMessage('Error al guardar: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCategories();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'categories.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showMessage('JSON exportado');
    } catch (err) {
      showMessage('Error al exportar: ' + err.message, 'error');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.categories && Array.isArray(json.categories)) {
          setCategories(json.categories);
          showMessage('JSON importado - Guarda para aplicar cambios');
        } else {
          showMessage('Formato de JSON inválido', 'error');
        }
      } catch (err) {
        showMessage('Error parseando JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = {
      name: newCategoryName.trim(),
      icon: '📋',
      keywords: []
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    setNewCategoryName('');
    setSelectedCategory(newCat);
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    if (!confirm(`¿Eliminar categoría "${selectedCategory.name}"?`)) return;
    const updated = categories.filter(c => c.name !== selectedCategory.name);
    setCategories(updated);
    setSelectedCategory(null);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !selectedCategory) return;
    if (selectedCategory.keywords.some(k => k.toUpperCase() === newKeyword.trim().toUpperCase())) {
      showMessage('Esta palabra ya existe', 'error');
      return;
    }
    const updatedKeywords = [...selectedCategory.keywords, newKeyword.trim()];
    const updatedCat = { ...selectedCategory, keywords: updatedKeywords };
    updateCategory(updatedCat);
    setNewKeyword('');
  };

  const handleCategoryNameChange = (newName) => {
    if (!newName.trim() || !selectedCategory) return;
    
    // Check for duplicate names
    if (categories.some(c => c.name.toUpperCase() === newName.trim().toUpperCase() && c.name !== selectedCategory.name)) {
      showMessage('Ya existe una categoría con ese nombre', 'error');
      return;
    }
    
    const updatedCat = { ...selectedCategory, name: newName.trim() };
    updateCategory(updatedCat);
  };

  const handleRemoveKeyword = (keywordIndex) => {
    if (!selectedCategory) return;
    const updatedKeywords = selectedCategory.keywords.filter((_, i) => i !== keywordIndex);
    const updatedCat = { ...selectedCategory, keywords: updatedKeywords };
    updateCategory(updatedCat);
  };

  const updateCategory = (updatedCat) => {
    setSelectedCategory(updatedCat);
    const updatedCategories = categories.map(c =>
      c.name === selectedCategory?.name ? updatedCat : c
    );
    setCategories(updatedCategories);
  };

  // Encontrar keywords duplicadas
  const duplicateWarnings = useMemo(() => {
    const warnings = [];
    const keywordMap = {};
    
    categories.forEach(cat => {
      cat.keywords.forEach(kw => {
        const upper = kw.toUpperCase();
        if (keywordMap[upper]) {
          warnings.push(`"${kw}" está en "${keywordMap[upper]}" y "${cat.name}"`);
        } else {
          keywordMap[upper] = cat.name;
        }
      });
    });
    
    return warnings;
  }, [categories]);

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-soft)' }}>
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-strong)' }}>
          Configuración de Categorías
        </h2>
        {statusMessage && (
          <span 
            className="px-3 py-1 rounded text-sm"
            style={{ 
              background: statusMessage.type === 'error' ? 'var(--bg-danger-soft)' : 'var(--bg-accent-soft)',
              color: statusMessage.type === 'error' ? 'var(--text-danger)' : 'var(--text-accent)'
            }}
          >
            {statusMessage.message}
          </span>
        )}
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar categorías o palabras clave..."
          className="w-full p-3 rounded-lg border"
          style={{ 
            background: 'var(--bg-panel)',
            borderColor: 'var(--border-soft)',
            color: 'var(--text-base)'
          }}
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-4">
        {/* Lista de categorías */}
        <div className="w-1/3 flex flex-col">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nueva categoría"
              className="flex-1 p-2 rounded border text-sm"
              style={{ 
                background: 'var(--bg-panel)',
                borderColor: 'var(--border-soft)',
                color: 'var(--text-base)'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-2 rounded font-medium text-white"
              style={{ background: 'var(--text-accent)' }}
              title="Agregar categoría"
            >
              +
            </button>
          </div>
          
          <ul className="flex-1 overflow-y-auto rounded-lg border" 
              style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
            {filteredCategories.map((category, index) => (
              <li
                key={index}
                className="p-3 cursor-pointer transition-colors"
                style={{ 
                  borderBottom: '1px solid var(--border-soft)',
                  background: selectedCategory?.name === category.name ? 'var(--bg-accent-soft)' : 'transparent'
                }}
                onClick={() => setSelectedCategory(category)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent-soft)'}
                onMouseLeave={(e) => {
                  if (selectedCategory?.name !== category.name) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span className="mr-2">{category.icon}</span>
                <span style={{ color: 'var(--text-base)' }}>{category.name}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-soft)' }}>
                  ({category.keywords.length})
                </span>
              </li>
            ))}
            {filteredCategories.length === 0 && (
              <li className="p-4 text-center" style={{ color: 'var(--text-soft)' }}>
                No se encontraron categorías
              </li>
            )}
          </ul>
        </div>

        {/* Editor de categoría */}
        <div className="w-2/3 flex flex-col rounded-lg border p-4" 
             style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
          {selectedCategory ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-strong)' }}>
                  {selectedCategory.name}
                </h3>
                <button
                  onClick={handleDeleteCategory}
                  className="px-3 py-1 rounded text-sm text-white"
                  style={{ background: 'var(--text-danger)' }}
                >
                  Eliminar
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
                  Nombre:
                </label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  className="w-full p-2 rounded border"
                  style={{ 
                    background: 'var(--bg-panel-strong)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--text-base)'
                  }}
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
                  Icono:
                </label>
                <input
                  type="text"
                  value={selectedCategory.icon}
                  onChange={(e) => updateCategory({ ...selectedCategory, icon: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ 
                    background: 'var(--bg-panel-strong)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--text-base)'
                  }}
                />
              </div>
              
              <div className="mb-4 flex-1">
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
                  Palabras clave:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedCategory.keywords.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                      style={{ background: 'var(--bg-accent-soft)', color: 'var(--text-base)' }}
                    >
                      {kw}
                      <button
                        onClick={() => handleRemoveKeyword(idx)}
                        className="font-bold hover:opacity-70"
                        style={{ color: 'var(--text-danger)' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedCategory.keywords.length === 0 && (
                    <span className="text-sm" style={{ color: 'var(--text-soft)' }}>
                      Sin palabras clave - todas las transacciones irán a "Otros"
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Nueva palabra clave"
                    className="flex-1 p-2 rounded border text-sm"
                    style={{ 
                      background: 'var(--bg-panel-strong)',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--text-base)'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="px-3 py-2 rounded text-sm text-white"
                    style={{ background: 'var(--text-base)' }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-soft)' }}>
              Selecciona una categoría para editar
            </div>
          )}
        </div>
      </div>

      {/* Preview de categorización */}
      <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
        <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
          Probar categorización:
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Escribí un comercio para probar..."
            className="flex-1 p-2 rounded border"
            style={{ 
              background: 'var(--bg-panel-strong)',
              borderColor: 'var(--border-soft)',
              color: 'var(--text-base)'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
          />
          <button
            onClick={handlePreview}
            className="px-4 py-2 rounded text-white"
            style={{ background: 'var(--text-accent)' }}
          >
            Probar
          </button>
        </div>
        {previewResult && (
          <div className="mt-2 text-sm" style={{ color: 'var(--text-base)' }}>
            Resultado: <span className="font-medium">{previewResult.icon} {previewResult.name}</span>
          </div>
        )}
      </div>

      {/* Warnings */}
      {duplicateWarnings.length > 0 && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-danger-soft)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-danger)' }}>
            ⚠️ Keywords duplicadas detectadas:
          </p>
          <ul className="text-sm list-disc list-inside" style={{ color: 'var(--text-danger)' }}>
            {duplicateWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-4 pt-4 flex flex-wrap gap-3 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded font-medium text-white disabled:opacity-50"
          style={{ background: 'var(--text-accent)' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded font-medium"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--text-base)' }}
        >
          Exportar JSON
        </button>
        <label className="px-4 py-2 rounded font-medium cursor-pointer"
               style={{ border: '1px solid var(--border-strong)', color: 'var(--text-base)' }}>
          Importar JSON
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>
    </div>
  );
};

export default CategoryConfig;
