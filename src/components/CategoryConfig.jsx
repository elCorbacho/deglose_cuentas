import React, { useState, useEffect } from 'react';
import { getCategories, saveCategories, exportCategories } from '../services/api';

const CategoryConfig = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data.categories);
    };
    loadCategories();
  }, []);

  const handleSave = async () => {
    await saveCategories({ version: '1.0', categories });
    alert('Categorías guardadas con éxito');
  };

  const handleExport = async () => {
    const blob = await exportCategories();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full">
      {/* Lista de categorías */}
      <div className="w-1/3 p-4 overflow-y-auto border-r">
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        <ul>
          {categories.map((category, index) => (
            <li
              key={index}
              className={`p-2 cursor-pointer ${selectedCategory?.name === category.name ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Editor de categoría */}
      <div className="w-2/3 p-4">
        {selectedCategory ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Editar Categoría: {selectedCategory.name}</h2>
            <div className="mb-4">
              <label className="block mb-2">Icono:</label>
              <input
                type="text"
                value={selectedCategory.icon}
                onChange={(e) => {
                  const updated = { ...selectedCategory, icon: e.target.value };
                  setSelectedCategory(updated);
                  const updatedCategories = categories.map(c =>
                    c.name === selectedCategory.name ? updated : c
                  );
                  setCategories(updatedCategories);
                }}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Palabras clave:</label>
              <textarea
                value={selectedCategory.keywords.join(', ')}
                onChange={(e) => {
                  const updated = {
                    ...selectedCategory,
                    keywords: e.target.value.split(',').map(k => k.trim())
                  };
                  setSelectedCategory(updated);
                  const updatedCategories = categories.map(c =>
                    c.name === selectedCategory.name ? updated : c
                  );
                  setCategories(updatedCategories);
                }}
                className="w-full p-2 border rounded"
                rows={5}
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            >
              Guardar
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Exportar
            </button>
          </div>
        ) : (
          <p>Selecciona una categoría para editar</p>
        )}
      </div>
    </div>
  );
};

export default CategoryConfig;