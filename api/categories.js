/**
 * Vercel Serverless Function - Categories API
 * Handles GET, POST, PUT, DELETE for categories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp for Vercel (serverless has no persistent storage)
// For development, use backend/data
const DATA_DIR =
  process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, '../backend/data');

const categoriesFilePath = path.join(DATA_DIR, 'categories.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Read categories file
async function readCategories() {
  try {
    ensureDataDir();
    if (!fs.existsSync(categoriesFilePath)) {
      return { version: '1.0', categories: [] };
    }
    const data = fs.readFileSync(categoriesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories:', error);
    return { version: '1.0', categories: [] };
  }
}

// Write categories file
async function writeCategories(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(categoriesFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing categories:', error);
    throw error;
  }
}

// Main handler
export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET / - Get all categories
    if (req.method === 'GET' && req.url === '/api/categories') {
      const data = await readCategories();
      res.status(200).json(data);
      return;
    }

    // GET /:name - Get specific category
    const nameMatch = req.url?.match(/^\/api\/categories\/([^/?]+)$/);
    if (req.method === 'GET' && nameMatch) {
      const name = decodeURIComponent(nameMatch[1]);
      const data = await readCategories();
      const category = data.categories?.find((c) => c.name === name);

      if (!category) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }

      res.status(200).json(category);
      return;
    }

    // POST / - Save all categories
    if (req.method === 'POST' && req.url === '/api/categories') {
      const { categories, version } = req.body;

      if (!Array.isArray(categories)) {
        res.status(400).json({ error: 'Categories must be an array' });
        return;
      }

      await writeCategories({ version: version || '1.0', categories });
      res.status(200).json({
        success: true,
        message: 'Categorías guardadas correctamente',
      });
      return;
    }

    // PUT /:name - Update specific category
    if (req.method === 'PUT' && nameMatch) {
      const name = decodeURIComponent(nameMatch[1]);
      const updatedCategory = req.body;

      const data = await readCategories();
      const index = data.categories?.findIndex((c) => c.name === name);

      if (index === -1) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }

      data.categories[index] = { ...data.categories[index], ...updatedCategory, name };
      await writeCategories(data);

      res.status(200).json({
        success: true,
        category: data.categories[index],
      });
      return;
    }

    // DELETE /:name - Delete specific category
    if (req.method === 'DELETE' && nameMatch) {
      const name = decodeURIComponent(nameMatch[1]);
      const data = await readCategories();
      const index = data.categories?.findIndex((c) => c.name === name);

      if (index === -1) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }

      const removed = data.categories.splice(index, 1)[0];
      await writeCategories(data);

      res.status(200).json({
        success: true,
        removed,
      });
      return;
    }

    // Default - Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
