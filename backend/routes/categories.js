import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data');
const categoriesFilePath = path.join(DATA_DIR, 'categories.json');
const backupFilePath = path.join(DATA_DIR, 'categories.backup.json');

// Logger helper
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...data };
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data ? JSON.stringify(data) : '');
};

// Validar estructura del JSON
function validateCategories(data) {
  const errors = [];
  
  if (!data) {
    errors.push('Datos vacíos');
    return { valid: false, errors };
  }
  
  if (!data.version || typeof data.version !== 'string') {
    errors.push('Falta campo "version" o es inválido');
  }
  
  if (!Array.isArray(data.categories)) {
    errors.push('Falta campo "categories" o no es un array');
    return { valid: false, errors };
  }
  
  for (let i = 0; i < data.categories.length; i++) {
    const cat = data.categories[i];
    
    if (!cat.name || typeof cat.name !== 'string') {
      errors.push(`Categoría ${i}: falta "name" o es inválido`);
    }
    
    if (!cat.icon || typeof cat.icon !== 'string') {
      errors.push(`Categoría "${cat.name || i}": falta "icon" o es inválido`);
    }
    
    if (!Array.isArray(cat.keywords)) {
      errors.push(`Categoría "${cat.name || i}": "keywords" debe ser un array`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Crear backup antes de guardar
function createBackup() {
  try {
    if (fs.existsSync(categoriesFilePath)) {
      fs.copyFileSync(categoriesFilePath, backupFilePath);
      log('info', 'Backup creado', { backup: backupFilePath });
      return true;
    }
  } catch (err) {
    log('error', 'Error creando backup', { error: err.message });
  }
  return false;
}

// GET /api/categories - Obtener todas
router.get('/', (req, res) => {
  log('info', 'GET /api/categories');
  
  fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
    if (err) {
      log('error', 'Error leyendo categorías', { error: err.message });
      return res.status(500).json({ error: 'Failed to read categories' });
    }
    
    try {
      const json = JSON.parse(data);
      log('info', 'Categorías obtenidas', { count: json.categories?.length });
      res.json(json);
    } catch (parseErr) {
      log('error', 'Error parseando JSON', { error: parseErr.message });
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// POST /api/categories - Guardar todas
router.post('/', (req, res) => {
  const categories = req.body;
  log('info', 'POST /api/categories', { version: categories?.version });
  
  // Validar estructura
  const validation = validateCategories(categories);
  if (!validation.valid) {
    log('warn', 'Validación fallida', { errors: validation.errors });
    return res.status(400).json({ 
      error: 'Validación fallida', 
      details: validation.errors 
    });
  }
  
  // Crear backup antes de guardar
  createBackup();
  
  fs.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2), (err) => {
    if (err) {
      log('error', 'Error guardando categorías', { error: err.message });
      return res.status(500).json({ error: 'Failed to save categories' });
    }
    
    log('info', 'Categorías guardadas exitosamente', { count: categories.categories.length });
    res.json({ success: true, message: 'Categorías guardadas correctamente' });
  });
});

// GET /api/categories/:name - Obtener una categoría
router.get('/:name', (req, res) => {
  const { name } = req.params;
  log('info', 'GET /api/categories/:name', { name });
  
  fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
    if (err) {
      log('error', 'Error leyendo categorías', { error: err.message });
      return res.status(500).json({ error: 'Failed to read categories' });
    }
    
    try {
      const json = JSON.parse(data);
      const category = json.categories.find(c => c.name === name);
      
      if (!category) {
        log('warn', 'Categoría no encontrada', { name });
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      res.json(category);
    } catch (parseErr) {
      log('error', 'Error parseando JSON', { error: parseErr.message });
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// PUT /api/categories/:name - Actualizar una categoría
router.put('/:name', (req, res) => {
  const { name } = req.params;
  const updatedCategory = req.body;
  log('info', 'PUT /api/categories/:name', { name, updated: updatedCategory.name });
  
  fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
    if (err) {
      log('error', 'Error leyendo categorías', { error: err.message });
      return res.status(500).json({ error: 'Failed to read categories' });
    }
    
    try {
      const json = JSON.parse(data);
      const index = json.categories.findIndex(c => c.name === name);
      
      if (index === -1) {
        log('warn', 'Categoría no encontrada para actualizar', { name });
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Crear backup
      createBackup();
      
      // Actualizar categoría
      json.categories[index] = { ...json.categories[index], ...updatedCategory, name };
      
      fs.writeFile(categoriesFilePath, JSON.stringify(json, null, 2), (writeErr) => {
        if (writeErr) {
          log('error', 'Error guardando categorías', { error: writeErr.message });
          return res.status(500).json({ error: 'Failed to save categories' });
        }
        
        log('info', 'Categoría actualizada', { name });
        res.json({ success: true, category: json.categories[index] });
      });
    } catch (parseErr) {
      log('error', 'Error parseando JSON', { error: parseErr.message });
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// DELETE /api/categories/:name - Eliminar una categoría
router.delete('/:name', (req, res) => {
  const { name } = req.params;
  log('info', 'DELETE /api/categories/:name', { name });
  
  fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
    if (err) {
      log('error', 'Error leyendo categorías', { error: err.message });
      return res.status(500).json({ error: 'Failed to read categories' });
    }
    
    try {
      const json = JSON.parse(data);
      const index = json.categories.findIndex(c => c.name === name);
      
      if (index === -1) {
        log('warn', 'Categoría no encontrada para eliminar', { name });
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Crear backup antes
      createBackup();
      
      // Eliminar categoría
      const removed = json.categories.splice(index, 1)[0];
      
      fs.writeFile(categoriesFilePath, JSON.stringify(json, null, 2), (writeErr) => {
        if (writeErr) {
          log('error', 'Error guardando categorías', { error: writeErr.message });
          return res.status(500).json({ error: 'Failed to save categories' });
        }
        
        log('info', 'Categoría eliminada', { name, removed });
        res.json({ success: true, removed });
      });
    } catch (parseErr) {
      log('error', 'Error parseando JSON', { error: parseErr.message });
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// POST /api/categories/reload - Recargar desde archivo
router.post('/reload', (req, res) => {
  log('info', 'POST /api/categories/reload');
  
  // Simplemente releemos el archivo
  fs.readFile(categoriesFilePath, 'utf8', (err, data) => {
    if (err) {
      log('error', 'Error recargando categorías', { error: err.message });
      return res.status(500).json({ error: 'Failed to reload categories' });
    }
    
    try {
      const json = JSON.parse(data);
      log('info', 'Categorías recargadas', { count: json.categories.length });
      res.json({ success: true, message: 'Categorías recargadas', data: json });
    } catch (parseErr) {
      log('error', 'Error parseando JSON', { error: parseErr.message });
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// GET /api/categories/export - Descargar JSON
router.get('/export', (req, res) => {
  log('info', 'GET /api/categories/export');
  res.download(categoriesFilePath, 'categories.json');
});

// GET /api/categories/backup - Descargar backup
router.get('/backup', (req, res) => {
  log('info', 'GET /api/categories/backup');
  
  if (!fs.existsSync(backupFilePath)) {
    return res.status(404).json({ error: 'No hay backup disponible' });
  }
  
  res.download(backupFilePath, 'categories.backup.json');
});

export default router;
